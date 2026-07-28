/* =========================================================
   script.js
   PhysicsLab — Kinematics
   Organized into independent modules, each initialized on load.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initSimulator();     // also wires charts + updates progress "study time" seed
  initSolver();
  initPractice();
  initQuiz();
  initProgress();
  initStudyTimer();
});

/* =========================================================
   NAVBAR — mobile toggle, smooth scroll, active link tracking
========================================================= */
function initNavbar() {
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const links = Array.from(navLinks.querySelectorAll('a'));
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close mobile menu after a link is tapped
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight the active nav link based on scroll position
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* =========================================================
   SCROLL REVEAL — fade in + slide up when elements enter view
========================================================= */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // small stagger for cards that reveal together
        setTimeout(() => entry.target.classList.add('is-visible'), (index % 6) * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
}

/* =========================================================
   SIMULATOR — sliders drive kinematics math and (via
   callbacks) the three live Chart.js graphs.
========================================================= */

// Shared simulation state, read by the graphs module.
const simState = { u: 5, a: 2, t: 4 };
const simGraphUpdaters = []; // functions to call whenever simState changes

function initSimulator() {
  const uSlider = document.getElementById('uSlider');
  const aSlider = document.getElementById('aSlider');
  const tSlider = document.getElementById('tSlider');

  const uValueEl = document.getElementById('uValue');
  const aValueEl = document.getElementById('aValue');
  const tValueEl = document.getElementById('tValue');

  const finalVelocityEl = document.getElementById('finalVelocity');
  const simDistanceEl = document.getElementById('simDistance');
  const avgVelocityEl = document.getElementById('avgVelocity');

  function computeAndRender() {
    const u = parseFloat(uSlider.value);
    const a = parseFloat(aSlider.value);
    const t = parseFloat(tSlider.value);

    simState.u = u;
    simState.a = a;
    simState.t = t;

    uValueEl.textContent = u.toFixed(0);
    aValueEl.textContent = a.toFixed(1);
    tValueEl.textContent = t.toFixed(1);

    // Core kinematics
    const v = u + a * t;                    // final velocity
    const s = u * t + 0.5 * a * t * t;       // displacement
    const avgV = (u + v) / 2;                // average velocity

    finalVelocityEl.textContent = v.toFixed(1);
    simDistanceEl.textContent = s.toFixed(1);
    avgVelocityEl.textContent = avgV.toFixed(1);

    // Push fresh numbers to the graphs
    simGraphUpdaters.forEach(fn => fn(u, a, t));
  }

  [uSlider, aSlider, tSlider].forEach(slider => {
    slider.addEventListener('input', computeAndRender);
  });

  window.addEventListener('resize', computeAndRender);

  // Initialize charts, then draw the first frame
  initGraphs();
  computeAndRender();
}

/* =========================================================
   GRAPHS — three live Chart.js canvases driven by simState
========================================================= */
function initGraphs() {
  // Register the annotation plugin once (it draws the labeled callout badges)
  if (window['chartjs-plugin-annotation'] && !Chart.registry.plugins.get('annotation')) {
    Chart.register(window['chartjs-plugin-annotation']);
  }

  // Shared badge factory: a small dot at the data point + a pill label
  // connected to it with a callout line, matching the "Δx / v_i / a" style.
  function badge(id, xValue, yValue, text, dotColor, pillColor, xAdjust, yAdjust) {
    return {
      [`${id}Dot`]: {
        type: 'point',
        xValue, yValue,
        backgroundColor: dotColor,
        borderColor: '#0B1120',
        borderWidth: 2,
        radius: 5,
        z: 20
      },
      [`${id}Label`]: {
        type: 'label',
        xValue, yValue,
        xAdjust, yAdjust,
        content: [text],
        color: '#F8FAFC',
        backgroundColor: pillColor,
        borderRadius: 999,
        padding: { top: 6, bottom: 6, left: 12, right: 12 },
        font: { family: 'Poppins', size: 12, weight: '600' },
        z: 21,
        callout: {
          enabled: true,
          side: 6,
          margin: 4,
          borderColor: pillColor,
          borderWidth: 1.5
        }
      }
    };
  }

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 350, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false }
    },
    elements: {
      point: { radius: 0 },
      line: { borderWidth: 3, tension: 0.25 }
    },
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: 'Time (s)', color: '#94A3B8' },
        ticks: { color: '#64748B' },
        grid: { color: 'rgba(148,163,184,0.08)' }
      },
      y: {
        ticks: { color: '#64748B' },
        grid: { color: 'rgba(148,163,184,0.08)' }
      }
    }
  };

  const positionCtx = document.getElementById('positionChart').getContext('2d');
  const velocityCtx = document.getElementById('velocityChart').getContext('2d');
  const accelerationCtx = document.getElementById('accelerationChart').getContext('2d');

  const positionChart = new Chart(positionCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{ data: [], borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)', fill: true }]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, title: { display: true, text: 'Position (m)', color: '#94A3B8' } }
      },
      plugins: { ...chartDefaults.plugins, annotation: { annotations: {} } }
    }
  });

  const velocityChart = new Chart(velocityCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{ data: [], borderColor: '#60A5FA', backgroundColor: 'rgba(96,165,250,0.15)', fill: true }]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, title: { display: true, text: 'Velocity (m/s)', color: '#94A3B8' } }
      },
      plugins: { ...chartDefaults.plugins, annotation: { annotations: {} } }
    }
  });

  const accelerationChart = new Chart(accelerationCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{ data: [], borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.15)', fill: true, stepped: true }]
    },
    options: {
      ...chartDefaults,
      scales: {
        ...chartDefaults.scales,
        y: { ...chartDefaults.scales.y, title: { display: true, text: 'Acceleration (m/s²)', color: '#94A3B8' } }
      },
      plugins: { ...chartDefaults.plugins, annotation: { annotations: {} } }
    }
  });

  // Register the updater that the simulator calls on every slider input.
  simGraphUpdaters.push((u, a, t) => {
    const steps = 24;
    const safeT = t > 0 ? t : 0.0001; // avoid a degenerate zero-length axis
    const positions = [];
    const velocities = [];
    const accelerations = [];

    for (let i = 0; i <= steps; i++) {
      const time = +((safeT * i) / steps).toFixed(3);
      positions.push({ x: time, y: +(u * time + 0.5 * a * time * time).toFixed(2) });
      velocities.push({ x: time, y: +(u + a * time).toFixed(2) });
      accelerations.push({ x: time, y: +a.toFixed(2) });
    }

    const finalPosition = positions[positions.length - 1].y;
    const midTime = +(safeT / 2).toFixed(2);

    // Position–Time: badge the total displacement reached at t
    positionChart.data.datasets[0].data = positions;
    positionChart.options.plugins.annotation.annotations = badge(
      'dx', t, finalPosition, 'Δx', '#93C5FD', '#2563EB', -34, -26
    );
    positionChart.update();

    // Velocity–Time: badge the initial velocity at t = 0
    velocityChart.data.datasets[0].data = velocities;
    velocityChart.options.plugins.annotation.annotations = badge(
      'vi', 0, u, 'v_i', '#BFDBFE', '#2563EB', 42, 16
    );
    velocityChart.update();

    // Acceleration–Time: badge the constant acceleration value
    accelerationChart.data.datasets[0].data = accelerations;
    accelerationChart.options.plugins.annotation.annotations = badge(
      'a', midTime, a, 'a', '#86EFAC', '#16A34A', 0, -30
    );
    accelerationChart.update();
  });
}

/* =========================================================
   SOLVER — step-by-step worked example from u, a, t
========================================================= */
function initSolver() {
  const solveBtn = document.getElementById('solveBtn');
  const output = document.getElementById('solverOutput');

  solveBtn.addEventListener('click', () => {
    const u = parseFloat(document.getElementById('solveU').value);
    const a = parseFloat(document.getElementById('solveA').value);
    const t = parseFloat(document.getElementById('solveT').value);

    if (Number.isNaN(u) || Number.isNaN(a) || Number.isNaN(t)) {
      output.innerHTML = '<div class="solver-placeholder">Please fill in all three values with valid numbers.</div>';
      return;
    }

    const v = u + a * t;
    const s = u * t + 0.5 * a * t * t;
    const avgV = (u + v) / 2;

    output.innerHTML = `
      <div class="solver-step" style="animation-delay:0.05s">
        <div class="step-label">Step 1 · Formula</div>
        <div class="step-body">Final velocity: v = u + at</div>
      </div>
      <div class="solver-step" style="animation-delay:0.15s">
        <div class="step-label">Step 2 · Substitution</div>
        <div class="step-body">v = ${u} + (${a} × ${t})</div>
      </div>
      <div class="solver-step solver-final" style="animation-delay:0.25s">
        <div class="step-label">Result</div>
        <div class="step-body">v = ${v.toFixed(2)} m/s</div>
      </div>

      <div class="solver-step" style="animation-delay:0.35s">
        <div class="step-label">Step 3 · Formula</div>
        <div class="step-body">Displacement: s = ut + ½at²</div>
      </div>
      <div class="solver-step" style="animation-delay:0.45s">
        <div class="step-label">Step 4 · Substitution</div>
        <div class="step-body">s = (${u} × ${t}) + ½ × ${a} × ${t}²</div>
      </div>
      <div class="solver-step solver-final" style="animation-delay:0.55s">
        <div class="step-label">Result</div>
        <div class="step-body">s = ${s.toFixed(2)} m</div>
      </div>

      <div class="solver-step" style="animation-delay:0.65s">
        <div class="step-label">Step 5 · Average Velocity</div>
        <div class="step-body">v̄ = (u + v) / 2 = (${u} + ${v.toFixed(2)}) / 2</div>
      </div>
      <div class="solver-step solver-final" style="animation-delay:0.75s">
        <div class="step-label">Result</div>
        <div class="step-body">v̄ = ${avgV.toFixed(2)} m/s</div>
      </div>
    `;

    solverState.solvedCount += 1;
  });
}

const solverState = { solvedCount: 0 };

/* =========================================================
   PRACTICE QUESTIONS — render from questions.js, filter, reveal answers
========================================================= */
const practiceState = { revealedIds: new Set() };

function initPractice() {
  const grid = document.getElementById('practiceGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function renderCards(filter) {
    grid.innerHTML = '';
    const filtered = practiceQuestions.filter(q => filter === 'all' || q.difficulty === filter);

    filtered.forEach(q => {
      const card = document.createElement('div');
      card.className = 'glass-card practice-card reveal is-visible';

      card.innerHTML = `
        <div class="practice-card-head">
          <span class="difficulty-tag ${q.difficulty}">${q.difficulty}</span>
          <span class="practice-q-num">Q${q.id}</span>
        </div>
        <p class="q-text">${q.question}</p>
        <button class="btn btn-ghost btn-sm show-answer-btn" data-id="${q.id}">Show Answer</button>
        <div class="practice-answer" id="answer-${q.id}">${q.answer}</div>
      `;
      grid.appendChild(card);
    });

    // Wire up "Show Answer" buttons for the freshly rendered cards
    grid.querySelectorAll('.show-answer-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const answerEl = document.getElementById(`answer-${id}`);
        const isShown = answerEl.classList.toggle('shown');
        btn.textContent = isShown ? 'Hide Answer' : 'Show Answer';

        if (isShown) {
          practiceState.revealedIds.add(id);
        } else {
          practiceState.revealedIds.delete(id);
        }
      });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCards(btn.getAttribute('data-filter'));
    });
  });

  renderCards('all');
}

/* =========================================================
   QUIZ — 10 MCQs with next/previous, scoring, and restart
========================================================= */
const quizState = {
  currentIndex: 0,
  answers: new Array(quizQuestions.length).fill(null) // stores chosen option index, or null
};

function initQuiz() {
  const questionEl = document.getElementById('quizQuestion');
  const optionsEl = document.getElementById('quizOptions');
  const quizBody = document.getElementById('quizBody');
  const positionEl = document.getElementById('quizPosition');
  const scoreEl = document.getElementById('quizScore');
  const progressFill = document.getElementById('quizProgressFill');
  const prevBtn = document.getElementById('quizPrevBtn');
  const nextBtn = document.getElementById('quizNextBtn');
  const restartBtn = document.getElementById('quizRestartBtn');

  const optionLetters = ['A', 'B', 'C', 'D'];

  function currentScore() {
    return quizState.answers.reduce((score, chosenIndex, i) => {
      if (chosenIndex !== null && chosenIndex === quizQuestions[i].correctIndex) {
        return score + 1;
      }
      return score;
    }, 0);
  }

  function renderQuestion() {
    const total = quizQuestions.length;
    const idx = quizState.currentIndex;

    if (idx >= total) {
      renderResult();
      return;
    }

    quizBody.style.display = '';
    restartBtn.style.display = 'none';
    nextBtn.style.display = '';

    const q = quizQuestions[idx];
    const chosen = quizState.answers[idx];

    questionEl.textContent = q.question;
    positionEl.textContent = `Question ${idx + 1} of ${total}`;
    scoreEl.textContent = currentScore();
    progressFill.style.width = `${((idx) / total) * 100 + (100 / total)}%`;

    optionsEl.innerHTML = '';
    q.options.forEach((optionText, optIndex) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'quiz-option';
      optBtn.innerHTML = `<span class="opt-letter">${optionLetters[optIndex]}</span><span>${optionText}</span>`;

      if (chosen !== null) {
        optBtn.disabled = true;
        if (optIndex === q.correctIndex) optBtn.classList.add('correct');
        if (optIndex === chosen && chosen !== q.correctIndex) optBtn.classList.add('wrong');
      }

      optBtn.addEventListener('click', () => {
        if (quizState.answers[idx] !== null) return; // already answered
        quizState.answers[idx] = optIndex;
        renderQuestion();
        updateProgressPanel();
      });

      optionsEl.appendChild(optBtn);
    });

    prevBtn.disabled = idx === 0;
    nextBtn.textContent = idx === total - 1 ? 'Finish →' : 'Next →';
  }

  function renderResult() {
    quizBody.style.display = 'none';
    nextBtn.style.display = 'none';
    restartBtn.style.display = '';
    prevBtn.disabled = false;

    const total = quizQuestions.length;
    const score = currentScore();
    progressFill.style.width = '100%';
    positionEl.textContent = `Quiz complete`;
    scoreEl.textContent = score;

    quizBody.style.display = 'block';
    quizBody.innerHTML = `
      <div class="quiz-result">
        <div class="section-eyebrow">Results</div>
        <div class="score-big">${score} / ${total}</div>
        <p style="color:var(--text-secondary)">${score >= total * 0.7 ? "Great work — you've got a solid grip on kinematics." : "Review the notes above and give it another shot."}</p>
      </div>
    `;

    updateProgressPanel();
  }

  prevBtn.addEventListener('click', () => {
    if (quizState.currentIndex > 0) {
      quizState.currentIndex -= 1;
      renderQuestion();
    }
  });

  nextBtn.addEventListener('click', () => {
    quizState.currentIndex += 1;
    renderQuestion();
  });

  restartBtn.addEventListener('click', () => {
    quizState.currentIndex = 0;
    quizState.answers = new Array(quizQuestions.length).fill(null);
    renderQuestion();
    updateProgressPanel();
  });

  renderQuestion();
}

/* =========================================================
   PROGRESS — animated circular rings, computed from real state
========================================================= */
function setRing(circleId, valueId, percent, isTime) {
  const circle = document.getElementById(circleId);
  const valueEl = document.getElementById(valueId);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${offset}`;

  valueEl.textContent = isTime ? `${Math.round(percent)}m` : `${Math.round(clamped)}%`;
}

function updateProgressPanel() {
  const totalTopics = 6; // Motion, Distance, Displacement, Speed, Velocity, Acceleration
  const topicsPercent = 100; // all topic cards are visible on load / covered by notes

  const answeredQuiz = quizState.answers.filter(a => a !== null).length;
  const correctQuiz = quizState.answers.reduce((acc, a, i) => acc + (a === quizQuestions[i].correctIndex ? 1 : 0), 0);
  const quizPercent = quizQuestions.length ? (correctQuiz / quizQuestions.length) * 100 : 0;

  const revealedCount = practiceState.revealedIds.size;
  const accuracyPercent = practiceQuestions.length
    ? Math.min(100, (revealedCount / practiceQuestions.length) * 100)
    : 0;

  setRing('ringTopics', 'ringTopicsValue', topicsPercent, false);
  setRing('ringQuiz', 'ringQuizValue', quizPercent, false);
  setRing('ringAccuracy', 'ringAccuracyValue', accuracyPercent, false);
  setRing('ringTime', 'ringTimeValue', studyMinutes, true);
}

function initProgress() {
  // Animate rings into place once the section scrolls into view
  const progressSection = document.getElementById('progress');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateProgressPanel();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(progressSection);
}

/* =========================================================
   STUDY TIMER — tracks time-on-page for the "Study Time" ring
========================================================= */
let studyMinutes = 0;

function initStudyTimer() {
  const startTime = Date.now();
  setInterval(() => {
    studyMinutes = (Date.now() - startTime) / 60000;
    updateProgressPanel();
  }, 15000); // refresh every 15s — plenty smooth for a minutes-scale metric
}
