window.onload = function () {
    fetch('public/graph-data.json')
        .then(response => response.json())
        .then(data => {

            const graph = new graphology.Graph();

            // Load nodes and edges into the graph
            data.nodes.forEach(node => {
                graph.addNode(node.id, {
                    label: node.label,
                    position: "WIP",
                    department: "WIP",
                    x: Math.random(),
                    y: Math.random(),
                    size: 5
                });
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
            const renderer = new Sigma(graph, document.getElementById("sigma-container"));

            // State for tracking hover, search, and selections
            const state = {
                hoveredNode: undefined,
                searchQuery: "",
                selectedNode: undefined,
                suggestions: undefined,
                hoveredNeighbors: undefined,
            };

            // Function to handle hovering on nodes
            function setHoveredNode(node) {
                if (node) {
                    state.hoveredNode = node;
                    state.hoveredNeighbors = new Set(graph.neighbors(node));
                } else {
                    state.hoveredNode = undefined;
                    state.hoveredNeighbors = undefined;
                }
                renderer.refresh({ skipIndexation: true });
            }

            // Handle node hover events
            renderer.on("enterNode", ({ node }) => setHoveredNode(node));
            renderer.on("leaveNode", () => setHoveredNode(undefined));

            // Node reducer: dynamically change node appearance based on hover and search
            renderer.setSetting("nodeReducer", (node, data) => {
                const res = { ...data };
                if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
                    res.label = "";
                    res.color = "#f6f6f6";
                }
                if (state.selectedNode === node) {
                    res.highlighted = true;
                } else if (state.suggestions && !state.suggestions.has(node)) {
                    res.label = "";
                    res.color = "#f6f6f6";
                }
                return res;
            });

            // Edge reducer: dynamically hide edges not connected to hovered or selected nodes
            renderer.setSetting("edgeReducer", (edge, data) => {
                const res = { ...data };
                if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
                    res.hidden = true;
                }
                if (state.suggestions && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))) {
                    res.hidden = true;
                }
                return res;
            });

        })
        .catch(error => console.error('Error loading the graph data:', error));
};

