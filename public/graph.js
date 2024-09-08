window.onload = function () {
    fetch('public/graph-data.json')
        .then(response => response.json())
        .then(data => {

            const graph = new graphology.Graph();

            // Load nodes and edges into the graph
            data.nodes.forEach(node => {
                graph.addNode(node.id, {
                    label: node.label,
                    position: node.position || null,
                    department: node.department || null,
                    x: Math.random(),
                    y: Math.random(),
                    size: 5,
                    color: getDepartmentColor(node.department || null),
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
            };

            function setHoveredNode(node) {
                if (node) {
                    state.hoveredNode = node;
                } else {
                    state.hoveredNode = undefined;
                }
                renderer.refresh({ skipIndexation: true });
            }

            function setSelectedNode(node) {
                if (state.selectedNode === node) {
                    // Deselect the node if already selected
                    state.selectedNode = undefined;
                } else {
                    state.selectedNode = node;
                }
                renderer.refresh({ skipIndexation: true });
            }

            // Handle node hover events
            renderer.on("enterNode", ({ node }) => setHoveredNode(node));
            renderer.on("leaveNode", () => setHoveredNode(undefined));

            // Handle node click events for selection
            renderer.on("clickNode", ({ node }) => setSelectedNode(node));

            // Handle clicking on the canvas to deselect nodes
            renderer.on("clickStage", () => {
                state.selectedNode = undefined;
                renderer.refresh({ skipIndexation: true });
            });

            // Node reducer: dynamically change node appearance
            renderer.setSetting("nodeReducer", (node, data) => {
                const res = { ...data };

                // If there is a selected node
                if (state.selectedNode) {
                    // Show additional information for the selected node
                    if (state.selectedNode === node) {
                        res.highlighted = true;
                        const position = graph.getNodeAttribute(node, "position");
                        const department = graph.getNodeAttribute(node, "department");
                        if (position && position !== "") {
                            res.label = `${data.label} | ${position} | ${department}`;
                        }
                    }
                    // Show the label of a hovered node
                    else if (state.hoveredNode && state.hoveredNode === node) {
                        const position = graph.getNodeAttribute(node, "position");
                        const department = graph.getNodeAttribute(node, "department");
                        if (position && position !== "") {
                            res.label = `${data.label} | ${position} | ${department}`;
                        }

                        // keep hovered node dim if non-neighbor
                        if (!graph.neighbors(state.selectedNode).includes(node))
                            res.color = "#f6f6f6";
                    }
                    // Show the labels of neighboring nodes without highlighting them
                    else if (graph.neighbors(state.selectedNode).includes(node)) {
                        res.forceLabel = true;
                    }
                    // Hovering over a neighbor node will show its neighbors
                    else if (graph.neighbors(state.selectedNode).includes(state.hoveredNode)
                        && graph.neighbors(state.hoveredNode).includes(node)) {
                        res.forceLabel = true;
                    }
                    // Dim nodes that are not the selected node or its neighbors
                    else {
                        res.label = "";
                        res.color = "#f6f6f6";
                    }
                }
                // If no node is selected, handle hover behavior
                else if (state.hoveredNode) {
                    // Show additional information for the hovered node
                    if (state.hoveredNode === node) {
                        res.highlighted = true;
                        const position = graph.getNodeAttribute(node, "position");
                        const department = graph.getNodeAttribute(node, "department");
                        if (position && position !== "") {
                            res.label = `${data.label} | ${position} | ${department}`;
                        }
                    }
                    // Show the labels of neighboring nodes without highlighting them
                    else if (graph.neighbors(state.hoveredNode).includes(node)) {
                        res.forceLabel = true;
                    }
                    // Dim nodes that are not the hovered node or its neighbors
                    else {
                        res.label = "";
                        res.color = "#f6f6f6";
                    }
                }

                return res;
            });


            // Edge reducer: dynamically hide edges not connected to hovered or selected nodes
            renderer.setSetting("edgeReducer", (edge, data) => {
                const res = { ...data };

                // If there is a selected node
                if (state.selectedNode) {
                    // Hovering over selected node's neighbor shows all of its edges
                    if (state.hoveredNode
                        && graph.neighbors(state.selectedNode).includes(state.hoveredNode)
                        && graph.hasExtremity(edge, state.hoveredNode)) {
                        res.hidden = false;
                    }
                    // Hide all edges not connected to selected node or hovered neighbor
                    else if (!graph.hasExtremity(edge, state.selectedNode)) {
                        res.hidden = true;
                    }
                }
                // If no node is selected, handle hover behavior
                else if (state.hoveredNode) {
                    // Show edges that are connected to the hovered node
                    if (!graph.hasExtremity(edge, state.hoveredNode)) {
                        res.hidden = true;
                    }
                }

                return res;
            });


        })
        .catch(error => console.error('Error loading the graph data:', error));
};

const departmentColors = {
    "BOARD OF ELECTION COMMISSIONERS": "#FF5733",
    "BOARD OF ETHICS": "#33FF57",
    "CHICAGO ANIMAL CARE AND CONTROL": "#5733FF",
    "CHICAGO COMMISSION ON HUMAN RELATIONS": "#FF33A5",
    "CHICAGO DEPARTMENT OF AVIATION": "#33A5FF",
    "CHICAGO DEPARTMENT OF PUBLIC HEALTH": "#FF9933",
    "CHICAGO DEPARTMENT OF TRANSPORTATION": "#9933FF",
    "CHICAGO FIRE DEPARTMENT": "#ff2121",
    "CHICAGO POLICE BOARD": "#999999",
    "CHICAGO POLICE DEPARTMENT": "#3f55ff",
    "CHICAGO PUBLIC LIBRARY": "#999999",
    "CITY COUNCIL": "#999999",
    "CITY TREASURER'S OFFICE": "#999999",
    "CIVILIAN OFFICE OF POLICE ACCOUNTABILITY": "#999999",
    "COMMUNITY COMMISSION FOR PUBLIC SAFETY AND ACCOUNTABILITY": "#999999",
    "DEPARTMENT OF ADMINISTRATIVE HEARING": "#999999",
    "DEPARTMENT OF BUILDINGS": "#999999",
    "DEPARTMENT OF BUSINESS AFFAIRS AND CONSUMER PROTECTION": "#999999",
    "DEPARTMENT OF CULTURAL AFFAIRS AND SPECIAL EVENTS": "#999999",
    "DEPARTMENT OF ENVIRONMENT": "#999999",
    "DEPARTMENT OF FAMILY AND SUPPORT SERVICES": "#999999",
    "DEPARTMENT OF FINANCE": "#999999",
    "DEPARTMENT OF FLEET AND FACILITY MANAGEMENT": "#999999",
    "DEPARTMENT OF HOUSING": "#999999",
    "DEPARTMENT OF HUMAN RESOURCES": "#999999",
    "DEPARTMENT OF LAW": "#999999",
    "DEPARTMENT OF PLANNING AND DEVELOPMENT": "#999999",
    "DEPARTMENT OF PROCUREMENT SERVICES": "#999999",
    "DEPARTMENT OF STREETS AND SANITATION": "#999999",
    "DEPARTMENT OF TECHNOLOGY AND INNOVATION": "#999999",
    "DEPARTMENT OF WATER MANAGEMENT": "#999999",
    "LICENSE APPEAL COMMISSION": "#999999",
    "MAYORS OFFICE FOR PEOPLE WITH DISABILITIES": "#999999",
    "OFFICE OF BUDGET & MANAGEMENT": "#008a07",
    "OFFICE OF CITY CLERK": "#999999",
    "OFFICE OF EMERGENCY MANAGEMENT AND COMMUNICATIONS": "#999999",
    "OFFICE OF INSPECTOR GENERAL": "#999999",
    "OFFICE OF PUBLIC SAFETY ADMINISTRATION": "#999999",
    "OFFICE OF THE MAYOR": "#999999",
}

function getDepartmentColor(department) {
    return departmentColors[department] || "#999999";
}