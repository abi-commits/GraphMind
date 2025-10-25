from typing import List, Dict, Any
from src.config.logging import GraphMindException, logging

class KnowledgeGraphBuilder:
    def __init__(self) -> None:
        # Simplified builder - no NetworkX dependency
        pass

    def build_graph(self, entities: List[Dict[str, Any]], relationships: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            # Create entity mapping for consistent node IDs
            entity_map = {}
            for entity in entities:
                node_id = self._create_node_id(entity['name'], entity['type'])
                entity_map[entity['name']] = node_id

            # Filter valid relationships (both source and target entities exist)
            valid_relationships = []
            for rel in relationships:
                source_id = entity_map.get(rel['source'])
                target_id = entity_map.get(rel['target'])
                
                if source_id and target_id:
                    valid_relationships.append({
                        **rel,
                        'source_id': source_id,
                        'target_id': target_id
                    })
            
            # Generate visualization data for frontend
            visualization_data = self._generate_visualization_data(entities, valid_relationships, entity_map)
            metrics = self._compute_simple_metrics(entities, valid_relationships)
            
            return {
                "entities": entities,
                "relationships": valid_relationships,
                "metrics": metrics,
                "visualization": visualization_data
            }
        except Exception as e:
            logging.error(f"Error building knowledge graph: {e}")
            raise GraphMindException(f"Error building knowledge graph: {e}")
        
    def _create_node_id(self, name: str, entity_type: str) -> str:
        """Create a unique node ID from entity name and type"""
        return f"{entity_type.lower()}:{name.lower().replace(' ', '_')}"
    
    def _compute_simple_metrics(self, entities: List[Dict[str, Any]], relationships: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute basic graph metrics without NetworkX"""
        try:
            num_nodes = len(entities)
            num_edges = len(relationships)
            
            # Simple density calculation: actual_edges / max_possible_edges
            max_edges = num_nodes * (num_nodes - 1) if num_nodes > 1 else 1
            density = num_edges / max_edges if max_edges > 0 else 0
            
            # Count unique entities in relationships (rough connected components estimate)
            connected_entities = set()
            for rel in relationships:
                connected_entities.add(rel.get('source', ''))
                connected_entities.add(rel.get('target', ''))
            
            return {
                "num_nodes": num_nodes,
                "num_edges": num_edges,
                "density": round(density, 3),
                "connected_entities": len(connected_entities),
                "isolated_entities": num_nodes - len(connected_entities)
            }
        except Exception as e:
            logging.warning(f"Error computing metrics: {e}")
            return {"num_nodes": 0, "num_edges": 0, "density": 0, "connected_entities": 0, "isolated_entities": 0}
        
    def _generate_visualization_data(self, entities: List[Dict[str, Any]], relationships: List[Dict[str, Any]], entity_map: Dict[str, str]) -> Dict[str, Any]:
        """Generate visualization data structure for frontend D3.js consumption"""
        nodes = []
        edges = []
        
        # Convert entities to visualization nodes
        for entity in entities:
            node_id = entity_map.get(entity['name'], entity['name'])
            nodes.append({
                "id": node_id,
                "label": entity.get("name", node_id),
                "type": entity.get("type", "UNKNOWN").upper(),
                "description": entity.get("description", ""),
                "confidence": entity.get("confidence", 0.5)
            })

        # Convert relationships to visualization edges
        for rel in relationships:
            source_id = entity_map.get(rel['source'])
            target_id = entity_map.get(rel['target'])
            
            if source_id and target_id:
                edges.append({
                    "source": source_id,
                    "target": target_id,
                    "type": rel.get("type", "RELATED_TO").upper(),
                    "description": rel.get("description", ""),
                    "confidence": rel.get("confidence", 0.5)
                })

        # Compute metrics for this visualization
        metrics = self._compute_simple_metrics(entities, relationships)

        return {
            "nodes": nodes,
            "edges": edges,
            "metrics": metrics
        }