"""
Test script for Phase 0 AI Chat Enhancement System
Tests the new intelligent search orchestration and synthesis capabilities
"""

import asyncio
import logging
import json
import time
from typing import Dict, Any

from services.ai_service import AIService
from services.intelligent_search_orchestrator import IntelligentSearchOrchestrator
from services.information_synthesis_engine import InformationSynthesisEngine
from services.semantic_query_generator import SemanticQueryGenerator, QueryGenerationRequest

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Phase0TestSuite:
    """Test suite for Phase 0 enhancements"""
    
    def __init__(self):
        self.ai_service = AIService()
        self.search_orchestrator = IntelligentSearchOrchestrator()
        self.synthesis_engine = InformationSynthesisEngine()
        self.query_generator = SemanticQueryGenerator()
        
        # Test queries representing different financial scenarios
        self.test_queries = [
            {
                "query": "How is the Indian stock market performing today?",
                "intent": "market_update",
                "expected_improvements": ["multiple_queries", "current_data", "synthesis"]
            },
            {
                "query": "Should I invest in INFY stock right now?",
                "intent": "stock_research", 
                "expected_improvements": ["comprehensive_analysis", "conflict_detection", "citations"]
            },
            {
                "query": "What's the impact of RBI's latest policy on my portfolio?",
                "intent": "policy_impact",
                "expected_improvements": ["policy_analysis", "portfolio_context", "multiple_sources"]
            },
            {
                "query": "Which is better investment - mutual funds or direct equity?",
                "intent": "comparative_analysis",
                "expected_improvements": ["balanced_comparison", "conflict_resolution", "expert_insights"]
            }
        ]
        
        # Simulated user context for testing
        self.test_user_context = {
            "user_profile": {
                "name": "Test User",
                "age": 32,
                "profession": "Software Engineer",
                "location": "Bangalore, India"
            },
            "portfolio": {
                "stocks": [
                    {"symbol": "INFY", "company_name": "Infosys", "current_value": 150000},
                    {"symbol": "TCS", "company_name": "Tata Consultancy Services", "current_value": 200000},
                    {"symbol": "HDFCBANK", "company_name": "HDFC Bank", "current_value": 100000}
                ],
                "mutual_funds": [
                    {"scheme_name": "SBI Bluechip Fund", "current_value": 80000},
                    {"scheme_name": "HDFC Index Fund", "current_value": 60000}
                ]
            },
            "investment_profile": {
                "risk_tolerance": "Moderate",
                "investment_experience": "Intermediate"
            }
        }
    
    async def test_semantic_query_generation(self) -> Dict[str, Any]:
        """Test semantic query generation vs hardcoded templates"""
        
        logger.info("Testing semantic query generation...")
        results = {"test": "semantic_query_generation", "results": []}
        
        for test_case in self.test_queries:
            start_time = time.time()
            
            request = QueryGenerationRequest(
                user_query=test_case["query"],
                intent=test_case["intent"],
                user_context=self.test_user_context,
                max_queries=3
            )
            
            try:
                generated_queries = await self.query_generator.generate_queries(request)
                
                test_result = {
                    "input_query": test_case["query"],
                    "intent": test_case["intent"],
                    "generated_queries": [
                        {
                            "query": q.query,
                            "confidence": q.confidence,
                            "search_angle": q.search_angle,
                            "reasoning": q.reasoning
                        } for q in generated_queries
                    ],
                    "generation_time": time.time() - start_time,
                    "queries_generated": len(generated_queries),
                    "success": len(generated_queries) > 0
                }
                
                results["results"].append(test_result)
                logger.info(f"Generated {len(generated_queries)} queries for '{test_case['query']}'")
                
            except Exception as e:
                logger.error(f"Error in query generation test: {str(e)}")
                results["results"].append({
                    "input_query": test_case["query"],
                    "error": str(e),
                    "success": False
                })
        
        return results
    
    async def test_search_orchestration(self) -> Dict[str, Any]:
        """Test intelligent search orchestration"""
        
        logger.info("Testing search orchestration...")
        results = {"test": "search_orchestration", "results": []}
        
        for test_case in self.test_queries[:2]:  # Test first 2 to avoid rate limits
            start_time = time.time()
            
            try:
                orchestration_result = await self.search_orchestrator.orchestrate_search(
                    user_query=test_case["query"],
                    intent=test_case["intent"],
                    user_context=self.test_user_context,
                    max_results=10
                )
                
                test_result = {
                    "input_query": test_case["query"],
                    "intent": test_case["intent"],
                    "orchestration_summary": orchestration_result.search_summary,
                    "total_sources": orchestration_result.total_sources,
                    "results_count": len(orchestration_result.results),
                    "deduplication_stats": orchestration_result.deduplication_stats,
                    "query_performance": orchestration_result.query_performance,
                    "orchestration_time": time.time() - start_time,
                    "synthesis_ready": orchestration_result.synthesis_ready,
                    "success": len(orchestration_result.results) > 0
                }
                
                # Sample result quality
                if orchestration_result.results:
                    sample_result = orchestration_result.results[0]
                    test_result["sample_result"] = {
                        "title": sample_result.title[:100],
                        "source": sample_result.source,
                        "credibility_score": sample_result.credibility_score,
                        "relevance_score": sample_result.relevance_score,
                        "search_angle": sample_result.search_angle
                    }
                
                results["results"].append(test_result)
                logger.info(f"Orchestrated search found {len(orchestration_result.results)} results from {orchestration_result.total_sources} sources")
                
            except Exception as e:
                logger.error(f"Error in orchestration test: {str(e)}")
                results["results"].append({
                    "input_query": test_case["query"],
                    "error": str(e),
                    "success": False
                })
        
        return results
    
    async def test_information_synthesis(self) -> Dict[str, Any]:
        """Test information synthesis with conflict detection"""
        
        logger.info("Testing information synthesis...")
        results = {"test": "information_synthesis", "results": []}
        
        # Test synthesis using orchestration results
        for test_case in self.test_queries[:1]:  # Test first query
            start_time = time.time()
            
            try:
                # First get orchestration results
                orchestration_result = await self.search_orchestrator.orchestrate_search(
                    user_query=test_case["query"],
                    intent=test_case["intent"],
                    user_context=self.test_user_context,
                    max_results=8
                )
                
                # Then synthesize
                synthesis_result = await self.synthesis_engine.synthesize_information(
                    orchestration_result=orchestration_result,
                    user_query=test_case["query"],
                    user_context=self.test_user_context
                )
                
                test_result = {
                    "input_query": test_case["query"],
                    "sources_used": len(synthesis_result.source_citations),
                    "response_length": len(synthesis_result.synthesized_response),
                    "confidence_score": synthesis_result.confidence_score,
                    "conflicts_detected": len(synthesis_result.detected_conflicts),
                    "synthesis_metadata": synthesis_result.synthesis_metadata,
                    "synthesis_time": time.time() - start_time,
                    "success": bool(synthesis_result.synthesized_response)
                }
                
                # Sample conflicts
                if synthesis_result.detected_conflicts:
                    test_result["sample_conflicts"] = [
                        {
                            "type": conflict.conflict_type.value,
                            "confidence": conflict.confidence,
                            "claims": conflict.conflicting_claims
                        } for conflict in synthesis_result.detected_conflicts[:2]
                    ]
                
                # Response preview
                test_result["response_preview"] = synthesis_result.synthesized_response[:200] + "..."
                
                results["results"].append(test_result)
                logger.info(f"Synthesized response with {synthesis_result.confidence_score:.2f} confidence, {len(synthesis_result.detected_conflicts)} conflicts")
                
            except Exception as e:
                logger.error(f"Error in synthesis test: {str(e)}")
                results["results"].append({
                    "input_query": test_case["query"],
                    "error": str(e),
                    "success": False
                })
        
        return results
    
    async def test_end_to_end_improvement(self) -> Dict[str, Any]:
        """Test end-to-end AI service with Phase 0 improvements"""
        
        logger.info("Testing end-to-end AI service improvements...")
        results = {"test": "end_to_end_improvement", "results": []}
        
        for test_case in self.test_queries[:1]:  # Test one complete flow
            start_time = time.time()
            
            try:
                # Process chat message with enhanced system
                response = await self.ai_service.process_chat_message(
                    message=test_case["query"],
                    user_id="test-user",
                    conversation_id=None,
                    context=None
                )
                
                test_result = {
                    "input_query": test_case["query"],
                    "response_generated": bool(response.get("message")),
                    "response_length": len(response.get("message", "")),
                    "sources_provided": len(response.get("sources", [])),
                    "processing_time": time.time() - start_time,
                    "is_bot_response": response.get("is_bot", False),
                    "timestamp": response.get("timestamp"),
                    "success": not response.get("error")
                }
                
                # Response preview
                if response.get("message"):
                    test_result["response_preview"] = response["message"][:300] + "..."
                
                # Check for enhancement indicators in response
                message = response.get("message", "").lower()
                enhancement_indicators = {
                    "enhanced_search_mentioned": "enhanced search" in message,
                    "multiple_sources": "sources" in message or "according to" in message,
                    "confidence_mentioned": "confidence" in message,
                    "conflicts_mentioned": "conflict" in message or "however" in message,
                    "synthesis_quality": len(message.split('.')) > 3  # Multiple sentences indicate synthesis
                }
                
                test_result["enhancement_indicators"] = enhancement_indicators
                test_result["enhancement_score"] = sum(enhancement_indicators.values()) / len(enhancement_indicators)
                
                results["results"].append(test_result)
                logger.info(f"End-to-end test completed with enhancement score: {test_result['enhancement_score']:.2f}")
                
            except Exception as e:
                logger.error(f"Error in end-to-end test: {str(e)}")
                results["results"].append({
                    "input_query": test_case["query"],
                    "error": str(e),
                    "success": False
                })
        
        return results
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run complete test suite"""
        
        logger.info("Starting Phase 0 Enhancement Test Suite...")
        start_time = time.time()
        
        test_results = {
            "test_suite": "Phase 0 AI Chat Enhancements",
            "start_time": start_time,
            "tests": []
        }
        
        # Run individual tests
        test_functions = [
            self.test_semantic_query_generation,
            self.test_search_orchestration,
            self.test_information_synthesis,
            self.test_end_to_end_improvement
        ]
        
        for test_func in test_functions:
            try:
                result = await test_func()
                test_results["tests"].append(result)
                
                # Add small delay between tests to avoid rate limiting
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"Test function {test_func.__name__} failed: {str(e)}")
                test_results["tests"].append({
                    "test": test_func.__name__,
                    "error": str(e),
                    "success": False
                })
        
        # Calculate overall results
        total_time = time.time() - start_time
        successful_tests = sum(1 for test in test_results["tests"] 
                             if any(r.get("success", False) for r in test.get("results", [])))
        
        test_results["summary"] = {
            "total_time": total_time,
            "tests_run": len(test_results["tests"]),
            "successful_tests": successful_tests,
            "success_rate": successful_tests / len(test_results["tests"]) if test_results["tests"] else 0
        }
        
        logger.info(f"Test suite completed in {total_time:.2f}s with {successful_tests}/{len(test_results['tests'])} successful tests")
        
        return test_results


async def main():
    """Run the test suite"""
    
    print("🚀 Phase 0 AI Chat Enhancement Test Suite")
    print("=" * 50)
    
    test_suite = Phase0TestSuite()
    results = await test_suite.run_all_tests()
    
    # Save results to file
    with open("phase0_test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    # Print summary
    print("\n📊 Test Results Summary:")
    print(f"Tests Run: {results['summary']['tests_run']}")
    print(f"Successful: {results['summary']['successful_tests']}")
    print(f"Success Rate: {results['summary']['success_rate']:.1%}")
    print(f"Total Time: {results['summary']['total_time']:.2f}s")
    
    print("\n💾 Detailed results saved to: phase0_test_results.json")
    
    if results['summary']['success_rate'] >= 0.75:
        print("\n✅ Phase 0 enhancements are working well!")
    elif results['summary']['success_rate'] >= 0.5:
        print("\n⚠️ Phase 0 enhancements are partially working - review failures")
    else:
        print("\n❌ Phase 0 enhancements need debugging")


if __name__ == "__main__":
    asyncio.run(main())