window.onload = function () {
    fetch('public/graph-data.json')
        .then(response => response.json())
        .then(data => {

            const graph = new graphology.Graph();

            // Load nodes and edges into the graph
            data.nodes.forEach(node => {
                graph.addNode(node.id, {
                    label: node.label,
                    position: "Position",
                    department: "Department",
                    x: Math.random(),
                    y: Math.random(),
                    size: 5,
                    // color: "#e22653",
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



            // State for tracking hover
            const state = {
                hoveredNode: undefined,
                selectedNode: undefined,
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

            // Node reducer: dynamically change node appearance based on hover
            renderer.setSetting("nodeReducer", (node, data) => {
                const res = { ...data };

                // If the node is not hovered and is not a neighbor of the hovered node, dim it
                if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
                    res.label = "";
                    res.color = "#f6f6f6";
                }
                // If hovered node
                if (state.hoveredNode === node) {
                    res.highlighted = true;
                    // Display position and department on the label
                    const position = graph.getNodeAttribute(node, "position");
                    const department = graph.getNodeAttribute(node, "department");
                    if(position & position != "")
                        res.label = `${data.label} | ${position} | ${department}`;
                } 

                return res;
            });

            // Edge reducer: dynamically hide edges not connected to hovered or selected nodes
            renderer.setSetting("edgeReducer", (edge, data) => {
                const res = { ...data };
                if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
                    res.hidden = true;
                }
                return res;
            });

        })
        .catch(error => console.error('Error loading the graph data:', error));
};

