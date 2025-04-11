// Array of 24 Norwegian strengths.
const strengths = [
    "Mot", "Tålmodighet", "Visdom", "Utholdenhet", "Kjærlighet", "Empati",
    "Ærlighet", "Integritet", "Selvrespekt", "Medfølelse", "Kreativitet",
    "Innovasjon", "Selvtillit", "Besluttsomhet", "Nysgjerrighet", "Respekt",
    "Balanse", "Fleksibilitet", "Optimisme", "Sterk vilje", "Entusiasme",
    "Indre ro", "Tillit", "Kraft"
  ];
  
  // Utility: Convert polar coordinates to Cartesian coordinates.
  function polarToCartesian(cx, cy, r, angleDegrees) {
    const angleRadians = (angleDegrees - 90) * Math.PI / 180.0;
    return {
      x: cx + r * Math.cos(angleRadians),
      y: cy + r * Math.sin(angleRadians)
    };
  }
  
  // Utility: Returns the SVG path (a pie slice) for an arc from startAngle to endAngle.
  function describeArc(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = (endAngle - startAngle) <= 180 ? "0" : "1";
    const d = [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
    return d;
  }
  
  // Dynamically generate the SVG wheel.
  // The text in each segment is rotated using a tangent-based transformation.
  function generateWheel() {
    const svg = document.getElementById("wheelSvg");
    const cx = 250, cy = 250, r = 250;
    const numSegments = strengths.length;
    const sliceAngle = 360 / numSegments;
    svg.innerHTML = "";
  
    for (let i = 0; i < numSegments; i++) {
      const startAngle = i * sliceAngle;
      const endAngle   = startAngle + sliceAngle;
      const midAngle   = startAngle + sliceAngle / 2;
  
      // Create the wedge (path element).
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", describeArc(cx, cy, r, startAngle, endAngle));
      // Generate a distinct color for each slice.
      const hue = i * (360 / numSegments);
      path.setAttribute("fill", `hsl(${hue}, 80%, 60%)`);
      path.setAttribute("stroke", "#fff");
      path.setAttribute("stroke-width", "2");
      svg.appendChild(path);
  
      // Add a text element.
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      // Place the text at 65% of the radius along the midAngle.
      const textPos = polarToCartesian(cx, cy, r * 0.65, midAngle);
      text.setAttribute("x", textPos.x);
      text.setAttribute("y", textPos.y);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "#000");
      text.setAttribute("font-size", "16");
      text.setAttribute("font-family", "'Bubblegum Sans', cursive");
  
      // Compute the rotation so that text is oriented along the wheel tangent.
      // The tangent direction is the midAngle + 90 degrees.
      let textAngle = midAngle + 90;
      // For readability, if the angle falls into the upside-down range, add 180°.
      let normalized = textAngle % 360;
      if (normalized > 90 && normalized < 270) {
        textAngle += 180;
      }
      text.setAttribute("transform", `rotate(${textAngle} ${textPos.x} ${textPos.y})`);
      text.textContent = strengths[i];
      svg.appendChild(text);
    }
  }
  
  // One-spin-per-day functionality.
  function hasSpunToday() {
    const lastSpin = localStorage.getItem("lastSpinDate");
    if (!lastSpin) return false;
    const lastSpinDate = new Date(lastSpin);
    const today = new Date();
    return lastSpinDate.toDateString() === today.toDateString();
  }
  
  function setSpinToday() {
    localStorage.setItem("lastSpinDate", new Date());
  }
  
  generateWheel();
  
  let currentRotation = 0;
  const spinBtn = document.getElementById("spinBtn");
  const wheelContainer = document.getElementById("wheelContainer");
  const resultDiv = document.getElementById("result");
  
  if (hasSpunToday()) {
    spinBtn.disabled = true;
    resultDiv.textContent = "Du har allerede spunnet i dag. Kom tilbake i morgen!";
  }
  
  spinBtn.addEventListener("click", function() {
    if (hasSpunToday()) {
      alert("Du har allerede spunnet i dag!");
      return;
    }
  
    const numSegments = strengths.length;
    const sliceAngle  = 360 / numSegments;
    const randomIndex = Math.floor(Math.random() * numSegments);
    const midAngle = randomIndex * sliceAngle + sliceAngle / 2;
    
    // Calculate the rotation required so that the chosen segment aligns with the pointer at the top.
    let currentRotationMod = currentRotation % 360;
    if (currentRotationMod < 0) currentRotationMod += 360;
    let rotationNeeded = (360 - ((currentRotationMod + midAngle) % 360)) % 360;
    if (rotationNeeded < 45) {
      rotationNeeded += 360;
    }
    const extraFullSpins = 5 * 360;
    const additionalRotation = extraFullSpins + rotationNeeded;
    currentRotation += additionalRotation;
  
    wheelContainer.style.transform = "rotate(" + currentRotation + "deg)";
    setSpinToday();
  
    setTimeout(function() {
      resultDiv.textContent = "Din daglig styrke er: " + strengths[randomIndex];
    }, 4000);
  });  