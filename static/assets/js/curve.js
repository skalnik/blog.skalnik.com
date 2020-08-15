(() => {
  window.addEventListener("load", start);

  function start() {
    const canvas = document.getElementById("curve");
    if (canvas === null) {
      return;
    }

    const context = canvas.getContext("2d");
    const maxDepth = 8;

    const pixelRatio = (window.devicePixelRatio || 1) * 2;
    const canvasSize = canvas.getBoundingClientRect();
    canvas.width = canvasSize.width * pixelRatio;
    canvas.height = (canvasSize.width / 3.5) * pixelRatio;
    context.scale(pixelRatio, pixelRatio);

    var lineSegments = [];
    const length = canvasSize.width * 2;
    for (var depth = 1; depth <= maxDepth; depth++) {
      // Line segment distance is determined by first splitting the dimension into
      // quarters, as we draw recursively in quarters. Then divided by 2^depth
      // since that defines how small our base shape will be and thus how long
      // each line segment can possibly be
      const distance = length / 4 / Math.pow(2, depth);

      lineSegments = lineSegments.concat(
        sierpinski(depth, distance).concat(null)
      );
    }

    lineSegments = cullHiddenSegments(context, lineSegments);

    paint(context, lineSegments);
  }

  function sierpinski(depth, distance) {
    var segments = [];
    var x = 2 * distance;
    var y = distance;

    [segments, x, y] = sierpA(segments, depth, x, y, distance, distance);
    [segments, x, y] = draw(segments, x, y, distance, distance);
    [segments, x, y] = sierpB(segments, depth, x, y, distance, distance);
    [segments, x, y] = draw(segments, x, y, -distance, distance);
    [segments, x, y] = sierpC(segments, depth, x, y, distance, distance);
    [segments, x, y] = draw(segments, x, y, -distance, -distance);
    [segments, x, y] = sierpD(segments, depth, x, y, distance, distance);
    [segments, x, y] = draw(segments, x, y, distance, -distance);
    [segments, x, y] = draw(segments, x, y, distance, distance);

    return segments;
  }

  function sierpA(segments, depth, x, y, dx, dy) {
    if (depth > 0) {
      depth--;
      [segments, x, y] = sierpA(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, dx, dy);
      [segments, x, y] = sierpB(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, 2 * dx, 0);
      [segments, x, y] = sierpD(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, dx, -dy);
      [segments, x, y] = sierpA(segments, depth, x, y, dx, dy);
    }

    return [segments, x, y];
  }

  function sierpB(segments, depth, x, y, dx, dy) {
    if (depth > 0) {
      depth--;
      [segments, x, y] = sierpB(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, -dx, dy);
      [segments, x, y] = sierpC(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, 0, 2 * dy);
      [segments, x, y] = sierpA(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, dx, dy);
      [segments, x, y] = sierpB(segments, depth, x, y, dx, dy);
    }

    return [segments, x, y];
  }

  function sierpC(segments, depth, x, y, dx, dy) {
    if (depth > 0) {
      depth--;
      [segments, x, y] = sierpC(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, -dx, -dy);
      [segments, x, y] = sierpD(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, -2 * dx, 0);
      [segments, x, y] = sierpB(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, -dx, dy);
      [segments, x, y] = sierpC(segments, depth, x, y, dx, dy);
    }

    return [segments, x, y];
  }

  function sierpD(segments, depth, x, y, dx, dy) {
    if (depth > 0) {
      depth--;
      [segments, x, y] = sierpD(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, dx, -dy);
      [segments, x, y] = sierpA(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, 0, -2 * dy);
      [segments, x, y] = sierpC(segments, depth, x, y, dx, dy);
      [segments, x, y] = draw(segments, x, y, -dx, -dy);
      [segments, x, y] = sierpD(segments, depth, x, y, dx, dy);
    }

    return [segments, x, y];
  }

  function draw(segments, x, y, dx, dy) {
    segments.push({ x: x, y: y, dx: dx, dy: dy });

    return [segments, x + dx, y + dy];
  }

  function cullHiddenSegments(context, lines) {
    const newSegments = [];
    const rect = context.canvas.getBoundingClientRect();

    for (i = 0; i <= lines.length; i++) {
      var line = lines[i];

      if (line == null) {
        newSegments.push(null);
      } else if (
        line.x > 0 &&
        line.x < rect.width &&
        (line.y > 0 && line.y < rect.height)
      ) {
        newSegments.push(line);
      }
    }

    return newSegments;
  }

  function paint(context, lines) {
    paintSegment(context, lines, 0);
  }

  function paintSegment(context, lines, index) {
    const line = lines[index];
    const rect = context.canvas.getBoundingClientRect();

    if (line === null) {
      context.clearRect(0, 0, rect.width, rect.height);
    } else {
      context.beginPath();
      context.moveTo(line.x, line.y);
      context.lineTo(line.x + line.dx, line.y + line.dy);
      context.stroke();
    }

    window.requestAnimationFrame(() => {
      paintSegment(context, lines, index + 1);
    });
  }
})();
