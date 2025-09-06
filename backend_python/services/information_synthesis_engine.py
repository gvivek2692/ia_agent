"""
Information Synthesis Engine - LLM-powered synthesis of multiple sources
Combines search results into coherent, well-cited responses with conflict detection
"""

import logging
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

from openai import AsyncOpenAI
from services.intelligent_search_orchestrator import SearchResult, OrchestrationResult
from config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ConflictType(Enum):
    """Types of conflicts that can be detected"""
    NUMERICAL_DISCREPANCY = "numerical_discrepancy"
    CONTRADICTORY_CLAIMS = "contradictory_claims"
    TEMPORAL_INCONSISTENCY = "temporal_inconsistency"
    SOURCE_DISAGREEMENT = "source_disagreement"
    NO_CONFLICT = "no_conflict"


@dataclass
class DetectedConflict:
    """A conflict detected between sources"""
    conflict_type: ConflictType
    conflicting_sources: List[str]
    conflicting_claims: List[str]
    confidence: float
    resolution_suggestion: Optional[str] = None


@dataclass
class SynthesisResult:
    """Result of information synthesis"""
    synthesized_response: str
    source_citations: List[Dict[str, Any]]
    confidence_score: float
    detected_conflicts: List[DetectedConflict]
    synthesis_metadata: Dict[str, Any]


class InformationSynthesisEngine:
    """Synthesizes information from multiple sources with conflict detection"""
    
    def __init__(self):
        self.client = None
        if settings.openai_api_key:
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)
            logger.info("Information Synthesis Engine initialized with OpenAI")
        else:
            logger.warning("OpenAI API key not configured - synthesis unavailable")
        
        # Financial domain expertise for conflict detection
        self.financial_conflict_patterns = {
            "price_discrepancy": ["₹", "Rs", "price", "value", "worth"],
            "percentage_discrepancy": ["%", "percent", "percentage", "rate"],
            "date_inconsistency": ["today", "yesterday", "this week", "last month"],
            "recommendation_conflict": ["buy", "sell", "hold", "recommend", "suggest"]
        }
        
    async def synthesize_information(self, orchestration_result: OrchestrationResult,
                                   user_query: str, user_context: Optional[Dict[str, Any]] = None) -> SynthesisResult:
        """Synthesize information from orchestrated search results"""
        
        if not self.client:
            return self._fallback_synthesis(orchestration_result, user_query)
        
        if not orchestration_result.synthesis_ready or not orchestration_result.results:
            return self._minimal_synthesis(orchestration_result, user_query)
        
        try:
            start_time = datetime.now()
            
            # Detect conflicts between sources
            conflicts = await self._detect_conflicts(orchestration_result.results)
            
            # Generate synthesized response
            synthesized_response = await self._generate_synthesis(
                orchestration_result.results, user_query, user_context, conflicts
            )
            
            # Prepare citations
            citations = self._prepare_citations(orchestration_result.results)
            
            # Calculate confidence
            confidence = self._calculate_confidence(orchestration_result.results, conflicts)
            
            # Synthesis metadata
            synthesis_time = (datetime.now() - start_time).total_seconds()
            metadata = {
                "sources_used": len(orchestration_result.results),
                "conflicts_detected": len(conflicts),
                "synthesis_time_seconds": synthesis_time,
                "confidence_factors": {
                    "source_credibility": sum(r.credibility_score for r in orchestration_result.results) / len(orchestration_result.results),
                    "source_agreement": 1.0 - (len([c for c in conflicts if c.conflict_type != ConflictType.NO_CONFLICT]) / max(len(conflicts), 1)),
                    "information_completeness": min(1.0, len(orchestration_result.results) / 5.0)
                }
            }
            
            logger.info(f"Information synthesis completed: {len(orchestration_result.results)} sources, {len(conflicts)} conflicts")
            
            return SynthesisResult(
                synthesized_response=synthesized_response,
                source_citations=citations,
                confidence_score=confidence,
                detected_conflicts=conflicts,
                synthesis_metadata=metadata
            )
            
        except Exception as e:
            logger.error(f"Error in information synthesis: {str(e)}")
            return self._fallback_synthesis(orchestration_result, user_query)
    
    async def _detect_conflicts(self, results: List[SearchResult]) -> List[DetectedConflict]:
        """Detect conflicts between different sources"""
        
        if len(results) < 2:
            return []
        
        try:
            # Prepare conflict detection prompt
            source_summaries = []
            for i, result in enumerate(results[:5]):  # Limit to first 5 for conflict detection
                summary = f"Source {i+1} ({result.source}):\n"
                summary += f"Title: {result.title}\n"
                summary += f"Content: {result.snippet}\n"
                if result.date:
                    summary += f"Date: {result.date}\n"
                source_summaries.append(summary)
            
            system_prompt = """You are a financial information analyst. Analyze the provided sources for conflicts or contradictions.

            Look for:
            1. Numerical discrepancies (different prices, percentages, figures)
            2. Contradictory claims (opposite recommendations, conflicting facts)
            3. Temporal inconsistencies (conflicting dates or timelines)
            4. Source disagreements (reputable sources with opposing views)
            
            For each conflict found, provide:
            - Type of conflict
            - Which sources are conflicting
            - The specific conflicting claims
            - Confidence level (0.0-1.0)
            - Suggestion for resolution if possible
            
            Respond with a JSON array of conflicts. If no significant conflicts, return empty array."""
            
            user_prompt = f"""
            Analyze these sources for conflicts:
            
            {chr(10).join(source_summaries)}
            
            Detect any conflicts between these sources about financial information.
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=800,
                temperature=0.2
            )
            
            import json
            detected_conflicts_data = json.loads(response.choices[0].message.content)
            
            # Convert to DetectedConflict objects
            conflicts = []
            for conflict_data in detected_conflicts_data:
                try:
                    conflict = DetectedConflict(
                        conflict_type=ConflictType(conflict_data.get("type", "no_conflict")),
                        conflicting_sources=conflict_data.get("sources", []),
                        conflicting_claims=conflict_data.get("claims", []),
                        confidence=conflict_data.get("confidence", 0.5),
                        resolution_suggestion=conflict_data.get("resolution")
                    )
                    conflicts.append(conflict)
                except (ValueError, KeyError) as e:
                    logger.warning(f"Invalid conflict data: {conflict_data}, error: {e}")
                    continue
            
            return conflicts
            
        except Exception as e:
            logger.warning(f"Error in conflict detection: {str(e)}")
            return []
    
    async def _generate_synthesis(self, results: List[SearchResult], user_query: str,
                                user_context: Optional[Dict[str, Any]], 
                                conflicts: List[DetectedConflict]) -> str:
        """Generate synthesized response from multiple sources"""
        
        # Prepare source materials
        source_materials = []
        for i, result in enumerate(results[:8]):  # Use top 8 results
            material = f"[Source {i+1}] {result.source}"
            if result.date:
                material += f" ({result.date})"
            material += f"\nTitle: {result.title}\nContent: {result.snippet}\n"
            source_materials.append(material)
        
        # Prepare conflict information
        conflict_info = ""
        if conflicts:
            conflict_info = "\nIMPORTANT - DETECTED CONFLICTS:\n"
            for conflict in conflicts:
                if conflict.conflict_type != ConflictType.NO_CONFLICT:
                    conflict_info += f"- {conflict.conflict_type.value}: {', '.join(conflict.conflicting_claims)}\n"
                    if conflict.resolution_suggestion:
                        conflict_info += f"  Resolution: {conflict.resolution_suggestion}\n"
        
        # Prepare user context
        context_info = ""
        if user_context:
            portfolio = user_context.get('portfolio', {})
            if portfolio.get('stocks'):
                stocks = portfolio['stocks'][:3]
                symbols = [f"{stock.get('symbol', '')} ({stock.get('company_name', '')})" for stock in stocks]
                context_info = f"\nUser's Portfolio Context: {', '.join(symbols)}"
        
        system_prompt = f"""You are an expert financial analyst providing comprehensive, balanced analysis for Indian market investors.

        Your task is to synthesize information from multiple sources into a coherent, well-structured response.

        SYNTHESIS GUIDELINES:
        1. ACCURACY: Use exact figures, dates, and claims from sources
        2. BALANCE: Present multiple perspectives when sources differ
        3. CITATIONS: Reference sources using [Source X] format
        4. CONFLICTS: Address any contradictions transparently
        5. CONTEXT: Consider the user's investment context when relevant
        6. DISCLAIMERS: Include appropriate risk warnings for investment advice
        
        RESPONSE STRUCTURE:
        - Start with a clear, direct answer to the user's question
        - Present key findings with source citations
        - Address any conflicts or uncertainties
        - Provide actionable insights when appropriate
        - End with relevant disclaimers if giving investment-related information
        
        CITATION FORMAT:
        - Use [Source 1], [Source 2], etc. to cite specific claims
        - Multiple sources: [Sources 1, 3] for corroborated information
        - For conflicting info: "According to [Source 1]... however, [Source 2] suggests..."
        
        USER QUERY: {user_query}
        {context_info}
        {conflict_info}
        """
        
        user_prompt = f"""
        Synthesize the following sources to answer the user's query:
        
        {chr(10).join(source_materials)}
        
        Provide a comprehensive, well-cited response that addresses the user's question while acknowledging any conflicts or uncertainties in the information.
        """
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=1500,
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating synthesis: {str(e)}")
            return self._simple_synthesis(results, user_query)
    
    def _prepare_citations(self, results: List[SearchResult]) -> List[Dict[str, Any]]:
        """Prepare source citations for the response"""
        
        citations = []
        for i, result in enumerate(results):
            citation = {
                "id": i + 1,
                "title": result.title,
                "source": result.source,
                "url": result.url,
                "date": result.date,
                "credibility_score": result.credibility_score,
                "relevance_score": result.relevance_score,
                "search_angle": result.search_angle
            }
            citations.append(citation)
        
        return citations
    
    def _calculate_confidence(self, results: List[SearchResult], conflicts: List[DetectedConflict]) -> float:
        """Calculate overall confidence in the synthesized information"""
        
        if not results:
            return 0.0
        
        # Base confidence from source credibility
        avg_credibility = sum(r.credibility_score for r in results) / len(results)
        
        # Penalty for conflicts
        conflict_penalty = len([c for c in conflicts if c.conflict_type != ConflictType.NO_CONFLICT]) * 0.1
        
        # Bonus for multiple corroborating sources
        source_diversity_bonus = min(0.2, len(set(r.source for r in results)) * 0.05)
        
        # Bonus for recent information
        recent_bonus = 0.0
        for result in results:
            if result.date and any(word in result.date.lower() for word in ["today", "hour", "latest"]):
                recent_bonus += 0.05
                break
        
        confidence = avg_credibility + source_diversity_bonus + recent_bonus - conflict_penalty
        return max(0.0, min(1.0, confidence))
    
    def _simple_synthesis(self, results: List[SearchResult], user_query: str) -> str:
        """Simple rule-based synthesis when LLM is unavailable"""
        
        if not results:
            return "I apologize, but I couldn't find sufficient information to answer your query."
        
        # Group results by source credibility
        high_credibility = [r for r in results if r.credibility_score >= 0.8]
        medium_credibility = [r for r in results if 0.5 <= r.credibility_score < 0.8]
        
        response_parts = []
        
        # Start with most credible sources
        sources_to_use = high_credibility[:3] if high_credibility else medium_credibility[:3]
        
        response_parts.append(f"Based on the available information:")
        
        for i, result in enumerate(sources_to_use, 1):
            summary = f"[{i}] According to {result.source}"
            if result.date:
                summary += f" ({result.date})"
            summary += f": {result.snippet}"
            response_parts.append(summary)
        
        # Add sources
        response_parts.append("\nSources:")
        for i, result in enumerate(sources_to_use, 1):
            response_parts.append(f"{i}. {result.title} - {result.source}")
        
        return "\n\n".join(response_parts)
    
    def _fallback_synthesis(self, orchestration_result: OrchestrationResult, user_query: str) -> SynthesisResult:
        """Fallback synthesis when LLM is unavailable"""
        
        simple_response = self._simple_synthesis(orchestration_result.results, user_query)
        citations = self._prepare_citations(orchestration_result.results)
        
        return SynthesisResult(
            synthesized_response=simple_response,
            source_citations=citations,
            confidence_score=0.6,  # Lower confidence for rule-based synthesis
            detected_conflicts=[],
            synthesis_metadata={
                "fallback_mode": True,
                "sources_used": len(orchestration_result.results)
            }
        )
    
    def _minimal_synthesis(self, orchestration_result: OrchestrationResult, user_query: str) -> SynthesisResult:
        """Minimal synthesis when insufficient sources"""
        
        if orchestration_result.results:
            best_result = max(orchestration_result.results, 
                            key=lambda r: r.credibility_score * r.relevance_score)
            response = f"Based on available information from {best_result.source}: {best_result.snippet}"
            citations = [self._prepare_citations([best_result])[0]]
            confidence = best_result.credibility_score * 0.7  # Lower confidence for single source
        else:
            response = "I apologize, but I couldn't find sufficient reliable information to answer your query."
            citations = []
            confidence = 0.0
        
        return SynthesisResult(
            synthesized_response=response,
            source_citations=citations,
            confidence_score=confidence,
            detected_conflicts=[],
            synthesis_metadata={
                "insufficient_sources": True,
                "sources_available": len(orchestration_result.results)
            }
        )
    
    def get_synthesis_stats(self) -> Dict[str, Any]:
        """Get synthesis engine statistics"""
        
        return {
            "llm_available": self.client is not None,
            "supported_conflict_types": [ct.value for ct in ConflictType],
            "max_sources_processed": 8,
            "citation_format": "[Source X]"
        }