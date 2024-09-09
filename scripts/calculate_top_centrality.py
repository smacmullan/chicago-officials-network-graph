import json
import networkx as nx

with open('./public/graph-data.json', 'r') as f:
    data = json.load(f)

# Create a graph from data
G = nx.Graph()
for node in data['nodes']:
    G.add_node(node['id'], **node)
for edge in data['edges']:
    G.add_edge(edge['source'], edge['target'])


# Calculate top centrality
degree_centrality = nx.degree_centrality(G)
top_10_degree = sorted(degree_centrality.items(), key=lambda x: x[1], reverse=True)[:10]

betweenness_centrality = nx.betweenness_centrality(G)
top_10_betweenness = sorted(betweenness_centrality.items(), key=lambda x: x[1], reverse=True)[:10]


# Print info
def get_node_info(node_id):
    return G.nodes[node_id]['position'], G.nodes[node_id]['department']

print("Top 10 nodes by degree centrality:")
for node, centrality in top_10_degree:
    position, department = get_node_info(node)
    print(f"{node} |{position} | {department} - {centrality}")

print("\nTop 10 nodes by betweenness centrality:")
for node, centrality in top_10_betweenness:
    position, department = get_node_info(node)
    print(f"{node} |{position} | {department} - {centrality}")
