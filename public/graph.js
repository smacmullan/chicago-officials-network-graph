window.onload = function () {
    fetch('public/graph-data.json')
        .then(response => response.json())
        .then(data => {

            const graph = new graphology.Graph();

            // Load nodes and edges into the graph
            data.nodes.forEach(node => {
                graph.addNode(node.id, { label: node.label, x: Math.random(), y: Math.random(), size: 5 });
            });
            data.edges.forEach(edge => {
                graph.addEdge(edge.source, edge.target, { id: edge.id });
            });

            // apply force layouts
            graphologyLibrary.layoutForceAtlas2.assign(graph, {
                iterations: 100, 
                settings: {
                    gravity: 10
                }
            });

            // Instantiate sigma.js and render the graph
            const sigmaInstance = new Sigma(graph, document.getElementById("sigma-container"));
        })
        .catch(error => console.error('Error loading the graph data:', error));
};
