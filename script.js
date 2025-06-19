let workMinutes = 25;
let breakMinutes = 5;
let workDuration = workMinutes * 60;
let breakDuration = breakMinutes * 60;

let remainingSeconds = workDuration;
let timerId = null;
let isRunning = false;
let isWorking = true;
let isMuted = false;

function getTodayKey() {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

function saveRecord(subject, minutes) {
  const key = "pomodoro_records";
  const today = getTodayKey();
  const records = JSON.parse(localStorage.getItem(key)) || {};
  if (!records[today]) records[today] = [];
  records[today].push({ subject, minutes });
  localStorage.setItem(key, JSON.stringify(records));
  updateSummary();
}

function updateDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  document.getElementById("timer").textContent = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
  document.title = `${isWorking ? "作業中" : "休憩中"} - ${minutes}:${String(
    seconds
  ).padStart(2, "0")}`;
  document.getElementById("phaseLabel").textContent = isWorking
    ? "作業中"
    : "休憩中";
  document.body.className = isWorking ? "work" : "break";
}

function updateSummary() {
  const key = "pomodoro_records";
  const today = getTodayKey();
  const records = JSON.parse(localStorage.getItem(key)) || {};
  const todayRecords = records[today] || [];
  const count = todayRecords.length;
  const totalMinutes = todayRecords.reduce((sum, r) => sum + r.minutes, 0);
  document.getElementById("workCount").textContent = count;
  document.getElementById("totalMinutes").textContent = totalMinutes;
}

function tick() {
  if (remainingSeconds > 0) {
    remainingSeconds--;
    updateDisplay();
  } else {
    clearInterval(timerId);
    isRunning = false;
    document.getElementById("startPauseBtn").textContent = "スタート";

    if (isWorking) {
      const input = document.getElementById("subjectInput").value.trim();
      const subject = input === "" ? "ポモドーロタイマー" : input;
      saveRecord(subject, workMinutes);
    }

    isWorking = !isWorking;
    remainingSeconds = isWorking ? workDuration : breakDuration;
    updateDisplay();

    if (!isMuted) {
      const sound = document.getElementById("notificationSound");
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }
    }

    timerId = setInterval(tick, 1000);
    isRunning = true;
    document.getElementById("startPauseBtn").textContent = "一時停止";
  }
}

document.getElementById("startPauseBtn").addEventListener("click", function () {
  if (!isRunning) {
    timerId = setInterval(tick, 1000);
    isRunning = true;
    this.textContent = "一時停止";
  } else {
    clearInterval(timerId);
    isRunning = false;
    this.textContent = "スタート";
  }
});

document.getElementById("resetBtn").addEventListener("click", function () {
  clearInterval(timerId);
  isRunning = false;
  isWorking = true;
  remainingSeconds = workDuration;
  document.getElementById("startPauseBtn").textContent = "スタート";
  updateDisplay();
});

document.getElementById("testBtn").addEventListener("click", function () {
  remainingSeconds = 1;
  updateDisplay();
});

document.getElementById("increaseWork").addEventListener("click", () => {
  workMinutes++;
  workDuration = workMinutes * 60;
  if (isWorking) remainingSeconds = workDuration;
  document.getElementById("workMinutes").textContent = workMinutes;
  updateDisplay();
});

document.getElementById("decreaseWork").addEventListener("click", () => {
  if (workMinutes > 1) {
    workMinutes--;
    workDuration = workMinutes * 60;
    if (isWorking) remainingSeconds = workDuration;
    document.getElementById("workMinutes").textContent = workMinutes;
    updateDisplay();
  }
});

document.getElementById("increaseBreak").addEventListener("click", () => {
  breakMinutes++;
  breakDuration = breakMinutes * 60;
  if (!isWorking) remainingSeconds = breakDuration;
  document.getElementById("breakMinutes").textContent = breakMinutes;
  updateDisplay();
});

document.getElementById("decreaseBreak").addEventListener("click", () => {
  if (breakMinutes > 1) {
    breakMinutes--;
    breakDuration = breakMinutes * 60;
    if (!isWorking) remainingSeconds = breakDuration;
    document.getElementById("breakMinutes").textContent = breakMinutes;
    updateDisplay();
  }
});

document.getElementById("muteToggle").addEventListener("click", () => {
  isMuted = !isMuted;
  document.getElementById("muteToggle").textContent = isMuted ? "🔇" : "🔈";
});

updateDisplay();
updateSummary();
