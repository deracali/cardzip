import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { learningCourses } from '../data/learningData'
import { LearningFooter, LearningHeader } from './LearningLandingPage'
import './LearningExtraPages.css'

const quizQuestionsByCategory = {
  'Web Development': [
  {
    question: 'What is the main benefit of using semantic HTML?',
    options: ['It makes pages load without CSS', 'It gives content meaningful structure', 'It replaces JavaScript in every project', 'It automatically optimizes images'],
    answer: 1,
  },
  {
    question: 'Which CSS layout tool is best suited to a two-dimensional grid?',
    options: ['CSS Grid', 'The <br> element', 'Inline styles only', 'A text heading'],
    answer: 0,
  },
  {
    question: 'What should you do before shipping a responsive page?',
    options: ['Test it at multiple viewport sizes', 'Remove all headings', 'Disable keyboard focus', 'Use fixed widths everywhere'],
    answer: 0,
  },
  ],
  'AI & Data Science': [
    { question: 'What does a training dataset help a machine-learning model do?', options: ['Learn patterns from examples', 'Replace all product decisions', 'Guarantee a correct answer', 'Avoid needing evaluation'], answer: 0 },
    { question: 'Why keep data separate for testing a model?', options: ['To evaluate performance on unseen examples', 'To make the training set larger', 'To remove all uncertainty', 'To skip model validation'], answer: 0 },
    { question: 'Which is a responsible AI practice?', options: ['Check for bias and explain limitations', 'Use every available data point', 'Hide uncertainty from users', 'Skip human review'], answer: 0 },
  ],
  'UI/UX Design': [
    { question: 'What is a wireframe primarily used for?', options: ['Planning a screen’s structure and hierarchy', 'Choosing a final brand campaign', 'Measuring server performance', 'Writing application logic'], answer: 0 },
    { question: 'What is a useful way to discover usability issues early?', options: ['Test a prototype with representative users', 'Add more decorative effects', 'Skip feedback until launch', 'Increase the amount of text'], answer: 0 },
    { question: 'Why should interface text and controls have sufficient contrast?', options: ['To make content easier to perceive', 'To reduce page loading time', 'To replace keyboard support', 'To hide secondary actions'], answer: 0 },
  ],
  Business: [
    { question: 'What makes feedback most useful to a teammate?', options: ['It is specific, respectful and actionable', 'It focuses only on personality', 'It arrives after every deadline', 'It avoids describing outcomes'], answer: 0 },
    { question: 'What should a product roadmap help communicate?', options: ['Priorities and direction over time', 'A guaranteed delivery date for every idea', 'Individual employee rankings', 'A list of unverified assumptions'], answer: 0 },
    { question: 'What supports better team decisions?', options: ['Evidence, context and clear outcomes', 'The loudest opinion in the room', 'Avoiding discussion of trade-offs', 'Deciding before defining the problem'], answer: 0 },
  ],
  Marketing: [
    { question: 'What is the first step in planning a focused campaign?', options: ['Understand the audience and their needs', 'Choose every available channel', 'Write copy before setting a goal', 'Ignore how success will be measured'], answer: 0 },
    { question: 'Why measure campaign results?', options: ['To learn what worked and improve', 'To guarantee every campaign succeeds', 'To avoid learning about customers', 'To replace a clear strategy'], answer: 0 },
    { question: 'What makes a marketing experiment useful?', options: ['A clear hypothesis and measurable outcome', 'Changing every variable at once', 'Skipping a target audience', 'Relying only on impressions'], answer: 0 },
  ],
}

function LearningQuizPage({ courseId }) {
  const course = learningCourses.find((item) => item.id === courseId)
  const questions = quizQuestionsByCategory[course?.category] || quizQuestionsByCategory['Web Development']
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = questions[questionIndex]

  if (!course) {
    return (
      <div className="learning-site extra-site">
        <LearningHeader />
        <main className="extra-page"><div className="catalog-empty"><strong>Quiz not found</strong><a href="/courses">Browse courses</a></div></main>
        <LearningFooter />
      </div>
    )
  }

  function checkAnswer() {
    if (selectedAnswer === null || checked) return
    if (selectedAnswer === question.answer) setScore((current) => current + 1)
    setChecked(true)
  }

  function continueQuiz() {
    if (questionIndex === questions.length - 1) {
      setFinished(true)
      return
    }
    setQuestionIndex((current) => current + 1)
    setSelectedAnswer(null)
    setChecked(false)
  }

  return (
    <div className="learning-site extra-site">
      <LearningHeader />
      <main className="extra-page quiz-page">
        <a className="back-to-link" href={`/learn/${course.id}`}><ArrowLeft size={14} /> Back to lesson</a>
        <section className="quiz-card">
          {finished ? (
            <div className="quiz-result">
              <span className="quiz-result-icon"><Check size={23} /></span>
              <span className="section-kicker">Quiz complete</span>
              <h1>{score} out of {questions.length} correct</h1>
              <p>{score === questions.length ? 'Excellent work. You have a strong grasp of these ideas.' : 'Nice effort. Review the lesson and try again whenever you are ready.'}</p>
              <a className="button button-primary" href={`/learn/${course.id}`}>Return to course <ArrowRight size={15} /></a>
            </div>
          ) : (
            <>
              <span className="section-kicker">{course.category} · Knowledge check</span>
              <h1>{course.title} quiz</h1>
              <div className="quiz-progress-copy"><span>Question {questionIndex + 1} of {questions.length}</span><span>{score} correct so far</span></div>
              <div className="progress-line"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
              <h2>{question.question}</h2>
              <div className="quiz-options">
                {question.options.map((option, index) => {
                  const isCorrect = checked && index === question.answer
                  const isWrong = checked && selectedAnswer === index && index !== question.answer
                  const className = `quiz-option${selectedAnswer === index ? ' is-selected' : ''}${isCorrect ? ' is-correct' : ''}${isWrong ? ' is-wrong' : ''}`
                  return <button className={className} type="button" key={option} disabled={checked} aria-pressed={selectedAnswer === index} onClick={() => setSelectedAnswer(index)}><span>{String.fromCharCode(65 + index)}</span>{option}</button>
                })}
              </div>
              {checked && <p className={selectedAnswer === question.answer ? 'quiz-feedback is-correct' : 'quiz-feedback is-wrong'} role="status">{selectedAnswer === question.answer ? 'That’s right!' : `Not quite. ${question.options[question.answer]}`}</p>}
              <div className="quiz-actions">
                <a href={`/learn/${course.id}`}>Exit quiz</a>
                {checked
                  ? <button className="button button-primary" type="button" onClick={continueQuiz}>{questionIndex === questions.length - 1 ? 'See results' : 'Next question'} <ArrowRight size={14} /></button>
                  : <button className="button button-primary" type="button" onClick={checkAnswer} disabled={selectedAnswer === null}>Check answer <Check size={14} /></button>}
              </div>
            </>
          )}
        </section>
      </main>
      <LearningFooter />
    </div>
  )
}

export default LearningQuizPage
