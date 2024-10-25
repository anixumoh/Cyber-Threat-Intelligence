var graphCanvas;
var ctx;

var colors = {
  IP: 'blue',
  SUBDOMAIN: 'pink'
};

initChart = (drawCanvas, chartData) => {
  var graph = chartData;

  var graphWidth = window.innerWidth,
    graphHeight = window.innerHeight;

  if (drawCanvas) {
    graphCanvas = d3
      .select('#graphDiv')
      .append('canvas')
      .classed('mainCanvas', true)
      .attr('id', 'mainCanvas')
      .attr('width', 1200 + 'px')
      .attr('height', graphHeight + 'px')
      .node();

    ctx = graphCanvas.getContext('2d');
  }

  var r = 5,
    max = 671,
    simulation = d3
      .forceSimulation()
      .nodes(graph.nodes)
      .force(
        'link',
        d3
          .forceLink()
          .links(graph.edges)
          .distance(nodeLinkDistance)
          .strength(nodeLinkStrength)
          .id(function (d) {
            return d.id;
          })
      )
      .force(
        'charge',
        d3
          .forceManyBody()
          .strength(nodeChargeStrength)
          .distanceMax(graphWidth * 2)
      )
      .force('collide', d3.forceCollide().radius(nodeCollideRadius))
      .force('center', d3.forceCenter(graphWidth / 2, graphHeight / 2))
      .on('tick', update),
    transform = d3.zoomIdentity;

  d3.select(graphCanvas)
    .call(
      d3
        .drag()
        .container(graphCanvas)
        .subject(dragsubject)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
    )
    .call(
      d3
        .zoom()
        .scaleExtent([1 / 10, 8])
        .on('zoom', zoomed)
    );

  function nodePercent(n) {
    return 50 / max;
  }

  function nodeRadius(n) {
    return 1.5 * r + 3 * r * nodePercent(n);
  }

  function nodeCollideRadius(n) {
    return nodeRadius(n) + 1;
  }

  function nodeLinkDistance(e) {
    var n1 = graph.nodes[e.source.id],
      n2 = graph.nodes[e.target.id];

    var avg = (nodePercent(n1) + nodePercent(n2)) / 2;

    return 60 * avg;
  }

  function nodeLinkStrength(e) {
    var n1 = graph.nodes[e.source.id],
      n2 = graph.nodes[e.target.id];

    var avg = (nodePercent(n1) + nodePercent(n2)) / 2;

    return 1 - 1 * avg;
  }

  function nodeChargeStrength(n) {
    return -100 + -300 * nodePercent(n);
  }

  function zoomed() {
    transform = d3.event.transform;
    update();
  }

  function update() {
    ctx.save();
    ctx.clearRect(0, 0, graphWidth, graphHeight);
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    graph.edges.forEach(drawEdge);
    graph.nodes.forEach(drawNode);

    if (closeNodeClick) {
      d3.select('#clicktooltip')
        .style('opacity', 0.8)
        .style('top', transform.applyY(closeNodeClick.y) + 50 + 'px')
        .style('left', transform.applyX(closeNodeClick.x) - 250 + 'px')
        .html(closeNodeClick.label);
    } else {
      d3.select('#clicktooltip').style('opacity', 0);
    }

    if (closeNodeHover) {
      d3.select('#hovertooltip')
        .style('opacity', 0.8)
        .style('top', transform.applyY(closeNodeHover.y) + 50 + 'px')
        .style('left', transform.applyX(closeNodeHover.x) - 250 + 'px')
        .html(closeNodeHover.label);
    } else {
      d3.select('#hovertooltip').style('opacity', 0);
    }

    ctx.restore();
  }

  function drawNode(d) {
    var size = nodeRadius(d);

    ctx.beginPath();
    ctx.fillStyle = d.color;
    ctx.moveTo(d.x, d.y);
    ctx.arc(d.x, d.y, size, 0, 2 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.fill();
  }

  function drawEdge(e) {
    var dx = e.target.x - e.source.x,
      dy = e.target.y - e.source.y,
      align = 'center';

    ctx.beginPath();
    ctx.moveTo(e.source.x, e.source.y);
    ctx.lineTo(e.target.x, e.target.y);
    ctx.strokeStyle = '#aaa';
    ctx.stroke();

    var pad = 1 / 2;

    ctx.save();
    ctx.textAlign = align;
    ctx.translate(e.source.x + dx * pad, e.source.y + dy * pad);

    if (dx < 0) {
      ctx.rotate(Math.atan2(dy, dx) - Math.PI);
    } else {
      ctx.rotate(Math.atan2(dy, dx));
    }

    ctx.fillStyle = '#aaa';
    ctx.restore();
  }

  var closeNodeClick;
  var closeNodeHover;
  d3.select('canvas').on('click', function (d) {
    var p = d3.mouse(this);

    closeNodeClick = findNode(p[0], p[1]);
    update();
  });

  d3.select('canvas').on('mousemove', function (d) {
    var p = d3.mouse(this);

    closeNodeHover = findNode(p[0], p[1]);
    update();
  });

  function findNode(x, y) {
    var i,
      newx = transform.invertX(x),
      newy = transform.invertY(y),
      dx,
      dy,
      radius;

    for (i = graph.nodes.length - 1; i >= 0; --i) {
      node = graph.nodes[i];
      dx = newx - node.x;
      dy = newy - node.y;
      radius = nodeRadius(node);

      if (dx * dx + dy * dy < radius * radius) {
        return node;
      }
    }
  }

  function dragsubject() {
    var node = findNode(d3.event.x, d3.event.y);
    if (node) {
      node.x = transform.applyX(node.x);
      node.y = transform.applyY(node.y);
      return node;
    } else {
      return undefined;
    }
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = transform.invertX(d3.event.subject.x);
    d3.event.subject.fy = transform.invertY(d3.event.subject.y);
  }

  function dragged(d) {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
  }

  function dragended() {
    // setTimeout(() => {
    //   simulation.stop();
    // }, 3500);
  }

  update();
};

destroyGraph = () => {};
