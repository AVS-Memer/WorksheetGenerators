function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ---------------- MATH ---------------- */

function det3(a,b,c,d,e,f,g,h,i) {
  return a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
}

/* ---------------- FORMATTING ---------------- */

function formatEquation(coeffs, vars, rhs) {
  let out = "";
  let first = true;

  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i];
    const v = vars[i];

    if (v === "" || c === 0) continue;

    const abs = Math.abs(c);

    if (first) {
      out += (c < 0 ? "-" : "") + (abs === 1 ? "" : abs) + v;
      first = false;
    } else {
      out += (c < 0 ? " - " : " + ") + (abs === 1 ? "" : abs) + v;
    }
  }

  return `${out} = ${rhs}`;
}

/* ---------------- SAFE 3x3 MATRIX ---------------- */

function generateInvertibleMatrix3() {
  let M, D = 0;

  while (D === 0) {
    M = [
      [rand(-5,5), rand(-5,5), rand(-5,5)],
      [rand(-5,5), rand(-5,5), rand(-5,5)],
      [rand(-5,5), rand(-5,5), rand(-5,5)]
    ];

    D = det3(
      M[0][0], M[0][1], M[0][2],
      M[1][0], M[1][1], M[1][2],
      M[2][0], M[2][1], M[2][2]
    );
  }

  return M;
}

/* ---------------- SOLVERS ---------------- */

function solve3(M, V) {
  const D = det3(
    M[0][0], M[0][1], M[0][2],
    M[1][0], M[1][1], M[1][2],
    M[2][0], M[2][1], M[2][2]
  );

  const Dx = det3(
    V[0], M[0][1], M[0][2],
    V[1], M[1][1], M[1][2],
    V[2], M[2][1], M[2][2]
  );

  const Dy = det3(
    M[0][0], V[0], M[0][2],
    M[1][0], V[1], M[1][2],
    M[2][0], V[2], M[2][2]
  );

  const Dz = det3(
    M[0][0], M[0][1], V[0],
    M[1][0], M[1][1], V[1],
    M[2][0], M[2][1], V[2]
  );

  return {
    x: Dx / D,
    y: Dy / D,
    z: Dz / D
  };
}

function solve2(a1,b1,c1,a2,b2,c2) {
  const det = a1*b2 - a2*b1;
  return {
    x: (c1*b2 - c2*b1) / det,
    y: (a1*c2 - a2*c1) / det
  };
}

/* ---------------- SYSTEM GENERATION ---------------- */

function generateSystem() {
  const is2D = Math.random() < 0.1;

  if (is2D) {
    let a1,b1,a2,b2, det = 0;

    while (det === 0) {
      a1 = rand(-5,5);
      b1 = rand(-5,5);
      a2 = rand(-5,5);
      b2 = rand(-5,5);
      det = a1*b2 - a2*b1;
    }

    const x = rand(-10,10);
    const y = rand(-10,10);

    const c1 = a1*x + b1*y;
    const c2 = a2*x + b1*y;

    solve2(a1,b1,c1,a2,b2,c2);

    return {
      type: "2D",
      eq: [
        formatEquation([a1,b1], ["x","y"], c1),
        formatEquation([a2,b2], ["x","y"], c2)
      ],
      sol: `(${x}, ${y})`
    };
  }

  const M = generateInvertibleMatrix3();

  const x = rand(-5,5);
  const y = rand(-5,5);
  const z = rand(-5,5);

  const V = [
    M[0][0]*x + M[0][1]*y + M[0][2]*z,
    M[1][0]*x + M[1][1]*y + M[1][2]*z,
    M[2][0]*x + M[2][1]*y + M[2][2]*z
  ];

  solve3(M, V);

  return {
    type: "3D",
    eq: [
      formatEquation(M[0], ["x","y","z"], V[0]),
      formatEquation(M[1], ["x","y","z"], V[1]),
      formatEquation(M[2], ["x","y","z"], V[2])
    ],
    sol: `(${x}, ${y}, ${z})`
  };
}

/* ---------------- WORKSHEET ---------------- */

function generateWorksheet() {
  const n = parseInt(document.getElementById("count").value);
  const systems = [];

  for (let i = 0; i < n; i++) {
    systems.push(generateSystem());
  }

  let html = `<h2 class="screen-only">Worksheet</h2>`;

  systems.forEach((s, i) => {
    html += `
      <div class="problem">
        <div class="problem-line">
          <span class="num">${i + 1})</span>
          <span class="first-eq">${s.eq[0]}</span>
        </div>

        <div class="eq-indent">${s.eq.slice(1).join("<br>")}</div>
        <div class="space"></div>
      </div>
    `;
  });

  html += `<div class="answers"><h3>Answer Key</h3>`;

  systems.forEach((s, i) => {
    html += `<div class="sol">${i+1}. ${s.sol}</div>`;
  });

  html += `</div>`;

  document.getElementById("output").innerHTML = html;
}

generateWorksheet();