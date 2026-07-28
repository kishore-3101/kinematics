/* =========================================================
   questions.js
   Data only — practice question bank and quiz bank.
   Consumed by script.js
========================================================= */

// ---------- Practice Questions (15 total) ----------
const practiceQuestions = [
  {
    id: 1,
    difficulty: "easy",
    question: "A car travels 60 m in 10 s at constant speed. What is its speed?",
    answer: "Speed = Distance / Time = 60 / 10 = 6 m/s"
  },
  {
    id: 2,
    difficulty: "easy",
    question: "What is the difference between distance and displacement?",
    answer: "Distance is the total path length (scalar); displacement is the shortest straight-line change in position with direction (vector)."
  },
  {
    id: 3,
    difficulty: "easy",
    question: "A person walks 4 m east then 4 m west. What is their displacement?",
    answer: "0 m — the person returns to the starting point, so the net displacement is zero."
  },
  {
    id: 4,
    difficulty: "easy",
    question: "Is velocity a scalar or a vector quantity? Why?",
    answer: "Velocity is a vector because it has both magnitude (speed) and a specific direction."
  },
  {
    id: 5,
    difficulty: "easy",
    question: "A cyclist accelerates from 0 to 10 m/s in 5 s. Find the acceleration.",
    answer: "a = (v − u) / t = (10 − 0) / 5 = 2 m/s²"
  },
  {
    id: 6,
    difficulty: "medium",
    question: "A car starts at 5 m/s and accelerates at 2 m/s² for 6 s. Find its final velocity.",
    answer: "v = u + at = 5 + (2 × 6) = 17 m/s"
  },
  {
    id: 7,
    difficulty: "medium",
    question: "An object starts from rest and accelerates at 4 m/s² for 5 s. Find the distance covered.",
    answer: "s = ut + ½at² = 0 + ½(4)(5²) = 50 m"
  },
  {
    id: 8,
    difficulty: "medium",
    question: "A train slows from 30 m/s to 10 m/s over 200 m. Find its acceleration.",
    answer: "v² = u² + 2as → 10² = 30² + 2a(200) → a = (100 − 900) / 400 = −2 m/s²"
  },
  {
    id: 9,
    difficulty: "medium",
    question: "A ball's velocity increases from 2 m/s to 12 m/s in 5 s. Find the average velocity.",
    answer: "Average velocity = (u + v) / 2 = (2 + 12) / 2 = 7 m/s"
  },
  {
    id: 10,
    difficulty: "medium",
    question: "A cyclist covers 150 m in the first 10 s and 150 m in the next 20 s. Find the average speed for the whole journey.",
    answer: "Average speed = Total distance / Total time = 300 / 30 = 10 m/s"
  },
  {
    id: 11,
    difficulty: "hard",
    question: "A car accelerates uniformly from 4 m/s to 20 m/s while covering 96 m. Find the time taken.",
    answer: "Using v = u + at and s = (u+v)t/2: 96 = (4+20)t/2 → t = 8 s"
  },
  {
    id: 12,
    difficulty: "hard",
    question: "A stone is dropped and falls freely under gravity (g = 10 m/s²). Find the distance fallen in 4 s.",
    answer: "s = ut + ½at² = 0 + ½(10)(4²) = 80 m"
  },
  {
    id: 13,
    difficulty: "hard",
    question: "A car moving at 20 m/s decelerates at 4 m/s² until it stops. Find the distance travelled before stopping.",
    answer: "v² = u² + 2as → 0 = 400 − 2(4)s → s = 400 / 8 = 50 m"
  },
  {
    id: 14,
    difficulty: "hard",
    question: "Two cars start from the same point; Car A moves at constant 15 m/s, Car B starts from rest with acceleration 3 m/s². After how many seconds does Car B catch up to Car A?",
    answer: "Set displacements equal: 15t = ½(3)t² → 15t = 1.5t² → t = 10 s"
  },
  {
    id: 15,
    difficulty: "hard",
    question: "A body has initial velocity 6 m/s and uniform acceleration 2 m/s². Find the distance covered in the 5th second.",
    answer: "Distance in nth second = u + a(2n−1)/2 → 6 + 2(9)/2 = 6 + 9 = 15 m"
  }
];

// ---------- Quiz MCQs (10 total) ----------
const quizQuestions = [
  {
    question: "Which of the following is a vector quantity?",
    options: ["Distance", "Speed", "Displacement", "Time"],
    correctIndex: 2
  },
  {
    question: "What does the equation v = u + at represent?",
    options: [
      "Displacement over time",
      "Final velocity after uniform acceleration",
      "Average speed",
      "Distance in the nth second"
    ],
    correctIndex: 1
  },
  {
    question: "An object at rest has a velocity of:",
    options: ["Maximum", "Constant but non-zero", "Zero", "Undefined"],
    correctIndex: 2
  },
  {
    question: "Speed is calculated as:",
    options: [
      "Displacement ÷ Time",
      "Distance ÷ Time",
      "Velocity × Time",
      "Acceleration × Time"
    ],
    correctIndex: 1
  },
  {
    question: "If a car covers equal displacements in equal intervals of time, its motion is called:",
    options: ["Uniform acceleration", "Random motion", "Uniform motion", "Circular motion"],
    correctIndex: 2
  },
  {
    question: "Which formula gives displacement directly in terms of u, a and t?",
    options: ["v = u + at", "s = ut + ½at²", "v² = u² + 2as", "s = vt"],
    correctIndex: 1
  },
  {
    question: "A car's velocity changes from 10 m/s to 30 m/s in 5 s. Its acceleration is:",
    options: ["2 m/s²", "4 m/s²", "5 m/s²", "8 m/s²"],
    correctIndex: 1
  },
  {
    question: "Which of these best describes acceleration?",
    options: [
      "Rate of change of distance",
      "Rate of change of displacement",
      "Rate of change of velocity",
      "Rate of change of speed only"
    ],
    correctIndex: 2
  },
  {
    question: "If distance travelled and displacement magnitude are equal in a journey, the motion must be:",
    options: [
      "In a single straight line without reversing direction",
      "Circular",
      "Accelerating",
      "At rest"
    ],
    correctIndex: 0
  },
  {
    question: "Average speed for a journey is defined as:",
    options: [
      "(Initial velocity + Final velocity) / 2",
      "Total distance / Total time",
      "Displacement / Time",
      "Acceleration × Time"
    ],
    correctIndex: 1
  }
];
