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
                    // color: getDepartmentColor("BOARD OF ETHICS"),
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
                    if (position && position != "")
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