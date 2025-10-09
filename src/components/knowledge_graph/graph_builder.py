from typing import List, Dict, Any
import networkx as nx
from src.config.logging import GraphMindException, logging

class KnowledgeGraphBuilder:
    def __init__(self) -> None:
        self.graph = nx.DiGraph()

    def build_graph(self, entities: List[Dict[str, Any]], relationships: List[Dict[str, Any]]) -> Dict[str, Any]:
        try:
            self.graph.clear()

            # Add entities as nodes
            entity_map = {}
            for entity in entities:
                node_id = self._create_node_id(entity['name'], entity['type'])
                entity_map[entity['name']] = node_id

                self.graph.add_node(node_id, **entity)

            #Add relationships as edges
            for rel in relationships:
                source_id = entity_map.get(rel['source'])
                target_id = entity_map.get(rel['target'])

                if source_id and target_id:
                    self.graph.add_edge(source_id, target_id, **rel)
            
            metrics = self._compute_graph_metrics()
            return {
                "graph": self.graph,
                "entities": entities,
                "relationships": relationships,
                "metrics": metrics,
                "visualization": self._generate_visualization_data()
            }
        except Exception as e:
            logging.error(f"Error building knowledge graph: {e}")
            raise GraphMindException(f"Error building knowledge graph: {e}")
        
    def _create_node_id(self, name: str, entity_type: str) -> str:
        return f"{entity_type}:{name.lower().replace(' ', '_')}"
    
    def _compute_graph_metrics(self) -> Dict[str, Any]:
        try:
            return {
                "num_nodes": self.graph.number_of_nodes(),
                "num_edges": self.graph.number_of_edges(),
                "density": nx.density(self.graph) if self.graph.number_of_nodes() > 1 else 0,
                "connected_components": nx.number_weakly_connected_components(self.graph)
            }
        except:
            return {"num_nodes": 0, "num_edges": 0, "density": 0, "connected_components": 0}
        
    def _generate_visualization_data(self) -> Dict[str, Any]:
        nodes = []
        edges = []
        for node_id, node_data in self.graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "label": node_data.get("name", node_id),
                "type": node_data.get("type", "UNKNOWN"),
                "description": node_data.get("description", ""),
                "confidence": node_data.get("confidence", 0.5)
            })

        for source, target, edge_data in self.graph.edges(data=True):
            edges.append({
                "source": source,
                "target": target,
                "type": edge_data.get("type", "RELATED_TO"),
                "description": edge_data.get("description", ""),
                "confidence": edge_data.get("confidence", 0.5)
            })

        return {
            "nodes": nodes,
            "edges": edges,
            "metrics": self._compute_graph_metrics()
        }