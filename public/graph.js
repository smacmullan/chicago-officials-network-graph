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
                    size: mapSalarytoSize(node.salary),
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
                    gravity: 5
                }
            });

            // Instantiate sigma.js and render the graph
            const renderer = new Sigma(graph, document.getElementById("sigma-container"),
                {
                    labelDensity: 0.10, // Controls how many labels are shown at once (smaller = fewer labels) 
                    // labelGridCellSize: 100,  // Increase to reduce number of display labels in small area
                    hoverRenderer: drawHover,
                }
            );



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
                    }
                    // Show the label of a hovered node
                    else if (state.hoveredNode && state.hoveredNode === node) {
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
    "BOARD OF ELECTION COMMISSIONERS": "#32964d",
    "BOARD OF ETHICS": "#6bdd8c",
    "CHICAGO ANIMAL CARE AND CONTROL": "#284e37",
    "CHICAGO COMMISSION ON HUMAN RELATIONS": "#82d1f4",
    "CHICAGO DEPARTMENT OF AVIATION": "#4e2da6",
    "CHICAGO DEPARTMENT OF PUBLIC HEALTH": "#ac80c6",
    "CHICAGO DEPARTMENT OF TRANSPORTATION": "#9e1fff",
    "CHICAGO FIRE DEPARTMENT": "#ff2121",
    "CHICAGO POLICE BOARD": "#e057e1",
    "CHICAGO POLICE DEPARTMENT": "#3f55ff",
    "CHICAGO PUBLIC LIBRARY": "#048ad1",
    "CITY COUNCIL": "#1e438d",
    "CITY TREASURER'S OFFICE": "#eec8f1",
    "CIVILIAN OFFICE OF POLICE ACCOUNTABILITY": "#7212ff",
    "COMMUNITY COMMISSION FOR PUBLIC SAFETY AND ACCOUNTABILITY": "#b9cf84",
    "DEPARTMENT OF ADMINISTRATIVE HEARING": "#999999",
    "DEPARTMENT OF BUILDINGS": "#84ee15",
    "DEPARTMENT OF BUSINESS AFFAIRS AND CONSUMER PROTECTION": "#9f2114",
    "DEPARTMENT OF CULTURAL AFFAIRS AND SPECIAL EVENTS": "#fea27a",
    "DEPARTMENT OF ENVIRONMENT": "#ff1c5d",
    "DEPARTMENT OF FAMILY AND SUPPORT SERVICES": "#fbd127",
    "DEPARTMENT OF FINANCE": "#7f8861",
    "DEPARTMENT OF FLEET AND FACILITY MANAGEMENT": "#ff66d4",
    "DEPARTMENT OF HOUSING": "#999999",
    "DEPARTMENT OF HUMAN RESOURCES": "#999999",
    "DEPARTMENT OF LAW": "#999999",
    "DEPARTMENT OF PLANNING AND DEVELOPMENT": "#999999",
    "DEPARTMENT OF PROCUREMENT SERVICES": "#999999",
    "DEPARTMENT OF STREETS AND SANITATION": "#999999",
    "DEPARTMENT OF TECHNOLOGY AND INNOVATION": "#11fa86",
    "DEPARTMENT OF WATER MANAGEMENT": "#683c00",
    "LICENSE APPEAL COMMISSION": "#999999",
    "MAYORS OFFICE FOR PEOPLE WITH DISABILITIES": "#999999",
    "OFFICE OF BUDGET & MANAGEMENT": "#008a07",
    "OFFICE OF CITY CLERK": "#999999",
    "OFFICE OF EMERGENCY MANAGEMENT AND COMMUNICATIONS": "#999999",
    "OFFICE OF INSPECTOR GENERAL": "#999999",
    "OFFICE OF PUBLIC SAFETY ADMINISTRATION": "#999999",
    "OFFICE OF THE MAYOR": "#e37a02",
}

function getDepartmentColor(department) {
    return departmentColors[department] || "#999999";
}

const MIN_SALARY = 20000;
const MEDIAN_SALARY = 100000;
const MAX_SALARY = 300000;
const MIN_POINT_SIZE = 2;
const MAX_POINT_SIZE = 10;


function mapSalarytoSize(salary) {
    if (!salary)
        return 2;

    return (salary - MIN_SALARY) / (MAX_SALARY - MIN_SALARY) * (MAX_POINT_SIZE - MIN_POINT_SIZE) + MIN_POINT_SIZE;
}

const TEXT_COLOR = "#000000";
function drawRoundRect(
    ctx,
    x,
    y,
    width,
    height,
    radius,
) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawHover(context, data, settings) {
    const size = settings.labelSize;
    const font = settings.labelFont;
    const weight = settings.labelWeight;
    const subLabelSize = size - 2;

    const label = data.label;
    const departmentLabel = data.department || "";
    const positionLabel = data.position || "";

    // Draw the label background
    context.beginPath();
    context.fillStyle = "#fff";
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 2;
    context.shadowBlur = 8;
    context.shadowColor = "#000";

    context.font = `${weight} ${size}px ${font}`;
    const labelWidth = context.measureText(label).width;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    const departmentLabelWidth = departmentLabel ? context.measureText(departmentLabel).width : 0;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    const positionLabelWidth = positionLabel ? context.measureText(positionLabel).width : 0;

    const textWidth = Math.max(labelWidth, departmentLabelWidth, positionLabelWidth);

    const x = Math.round(data.x);
    const y = Math.round(data.y);
    const w = Math.round(textWidth + size / 2 + data.size + 3);
    const hLabel = Math.round(size / 2 + 4);
    const hDepartmentLabel = departmentLabel ? Math.round(subLabelSize / 2 + 9) : 0;
    const hPositionLabel = positionLabel? Math.round(subLabelSize / 2 + 9) : 0;

    drawRoundRect(context, x, y - hDepartmentLabel - 12, w, hPositionLabel + hLabel + hDepartmentLabel + 12, 5);
    context.closePath();
    context.fill();

    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;

    // Draw the labels
    if (departmentLabel) {
        // draw name with sub-labels
        context.fillStyle = TEXT_COLOR;
        context.font = `${weight} ${size}px ${font}`;
        context.fillText(label, data.x + data.size + 3, data.y - (2 * size) / 3 - 2);

        context.fillStyle = TEXT_COLOR;
        context.font = `${weight} ${subLabelSize}px ${font}`;
        context.fillText(positionLabel, data.x + data.size + 3, data.y + size / 3);
        
        context.fillStyle = data.color; // use to color text with node color
        context.font = `${weight} ${subLabelSize}px ${font}`;
        context.fillText(departmentLabel, data.x + data.size + 3, data.y + size / 3 + 3 + subLabelSize);
    }
    else{
        // center name vertically with no sub-labels
        context.fillStyle = TEXT_COLOR;
        context.font = `${weight} ${size}px ${font}`;
        context.fillText(label, data.x + data.size + 3, data.y + size / 3);
    }

}