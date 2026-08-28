/* Reusable quiz + recall components for lessons in this workspace.
 *
 * Quiz markup (options are plain <li>; this script turns them into buttons):
 *
 *   <div class="quiz" data-quiz data-title="Check yourself">
 *     <ol class="quiz-items">
 *       <li class="quiz-q" data-answer="2" data-explain="Because ...">
 *         <p class="quiz-prompt">Which stage failed?</p>
 *         <ul class="quiz-options">
 *           <li>The preprocessor</li>
 *           <li>The compiler</li>
 *           <li>The linker</li>
 *         </ul>
 *       </li>
 *     </ol>
 *   </div>
 *
 * data-answer is 1-based. For multiple correct answers use "1,3".
 * Feedback is immediate and a question locks after the first answer, so the
 * attempt is a real retrieval attempt rather than a guess-until-green loop.
 *
 * Recall markup:
 *
 *   <div class="recall" data-recall>
 *     <p class="recall-front">Say out loud what a translation unit is.</p>
 *     <p class="recall-back">A .cpp file after the preprocessor ...</p>
 *   </div>
 */

(function () {
  "use strict";

  function initQuiz(quiz) {
    var questions = Array.prototype.slice.call(quiz.querySelectorAll(".quiz-q"));
    if (!questions.length) return;

    var head = document.createElement("div");
    head.className = "quiz-head";
    var title = document.createElement("span");
    title.textContent = quiz.dataset.title || "Retrieval practice";
    var score = document.createElement("span");
    score.className = "quiz-score";
    head.appendChild(title);
    head.appendChild(score);
    quiz.insertBefore(head, quiz.firstChild);

    var answered = 0;
    var correct = 0;

    function paintScore() {
      score.textContent = answered
        ? correct + " / " + answered + " of " + questions.length
        : questions.length + " questions";
    }
    paintScore();

    questions.forEach(function (q) {
      var keys = String(q.dataset.answer || "")
        .split(",")
        .map(function (n) { return parseInt(n, 10); })
        .filter(function (n) { return !isNaN(n); });

      var options = Array.prototype.slice.call(q.querySelectorAll(".quiz-options > li"));
      var explain = null;

      if (q.dataset.explain) {
        explain = document.createElement("p");
        explain.className = "quiz-explain";
        explain.hidden = true;
        explain.innerHTML = q.dataset.explain;
        q.appendChild(explain);
      }

      var buttons = options.map(function (li, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-opt";
        btn.innerHTML = li.innerHTML;
        btn.addEventListener("click", function () { choose(i + 1); });
        li.innerHTML = "";
        li.appendChild(btn);
        return btn;
      });

      function mark(btn, glyph) {
        var span = document.createElement("span");
        span.className = "quiz-mark";
        span.textContent = glyph;
        btn.insertBefore(span, btn.firstChild);
      }

      function choose(picked) {
        var right = keys.indexOf(picked) !== -1;
        answered += 1;
        if (right) correct += 1;
        paintScore();

        buttons.forEach(function (btn, i) {
          var n = i + 1;
          btn.disabled = true;
          if (n === picked) {
            btn.dataset.state = right ? "correct" : "wrong";
            mark(btn, right ? "correct" : "not this");
          } else if (keys.indexOf(n) !== -1) {
            btn.dataset.state = "missed";
            mark(btn, "answer");
          } else {
            btn.dataset.state = "off";
          }
        });

        if (explain) explain.hidden = false;
      }
    });
  }

  function initRecall(card) {
    var back = card.querySelector(".recall-back");
    if (!back) return;
    back.hidden = true;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "recall-btn";
    btn.textContent = card.dataset.reveal || "Show the answer";
    btn.addEventListener("click", function () {
      back.hidden = false;
      btn.remove();
    });
    card.insertBefore(btn, back);
  }

  function boot() {
    document.querySelectorAll("[data-quiz]").forEach(initQuiz);
    document.querySelectorAll("[data-recall]").forEach(initRecall);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
