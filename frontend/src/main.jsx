import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

// Local requests go through Vite's proxy, avoiding browser CORS restrictions.
// The production URL works once the CORS configuration in App.py is redeployed.
const API_URL = import.meta.env.DEV
  ? '/api/predict'
  : 'https://wine-quality-dxqw.onrender.com/predict'

const fields = [
  ['fixed_acidity', 'Fixed acidity', 8.3, 0.1],
  ['volatile_acidity', 'Volatile acidity', 0.54, 0.01],
  ['citric_acid', 'Citric acid', 0.28, 0.01],
  ['residual_sugar', 'Residual sugar', 2.4, 0.1],
  ['chlorides', 'Chlorides', 0.08, 0.001],
  ['free_sulfur_dioxide', 'Free sulfur dioxide', 15, 1],
  ['total_sulfur_dioxide', 'Total sulfur dioxide', 45, 1],
  ['density', 'Density', 0.996, 0.0001],
  ['pH', 'pH', 3.3, 0.01],
  ['sulphates', 'Sulphates', 0.65, 0.01],
  ['alcohol', 'Alcohol', 10.5, 0.1],
]

const initialValues = Object.fromEntries(fields.map(([key, , value]) => [key, value]))

function App() {
  const [values, setValues] = React.useState(initialValues)
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const updateField = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const predict = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    const payload = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, Number(value)]),
    )

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error(`The service returned ${response.status}.`)
      setResult(await response.json())
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the prediction service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Wine analysis</p>
        <h1>Find the character<br />of your wine.</h1>
        <p className="intro">Enter the laboratory measurements below and let the model estimate its quality category.</p>
      </section>

      <section className="workspace" aria-label="Wine prediction form">
        <form onSubmit={predict}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Sample details</p>
              <h2>Composition</h2>
            </div>
            <button type="button" className="text-button" onClick={() => setValues(initialValues)}>Use example</button>
          </div>

          <div className="field-grid">
            {fields.map(([key, label, , step]) => (
              <label key={key}>
                <span>{label}</span>
                <input
                  type="number"
                  step={step}
                  min="0"
                  required
                  value={values[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
              </label>
            ))}
          </div>

          <button className="predict-button" disabled={loading}>
            {loading ? 'Analysing sample…' : 'Predict wine quality'}
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <aside className="result-panel" aria-live="polite">
          <div className="glass-icon" aria-hidden="true">◒</div>
          {!result && !error && <><p className="eyebrow">Model result</p><h2>Your prediction<br />will appear here.</h2><p>Complete the sample details and ask the model for an assessment.</p></>}
          {error && <><p className="eyebrow">Connection issue</p><h2>We couldn't analyse this sample.</h2><p>{error}</p></>}
          {result && <>
            <p className="eyebrow">Predicted quality</p>
            {result.prediction != null ? (result.prediction == 0 ? <div className="quality">Poor</div> : result.prediction == 1 ? <div className="quality">Average</div> : <div className="quality">Good</div>) : <div className="quality">N/A</div>}
            <p className="result-copy">Most likely quality category for this wine sample.</p>
            <p className="eyebrow">Confidence on Predicted Quality: <span style={{color:'white'}}>{result.top_3[0].probability != null ? `${(result.top_3[0].probability * 100).toFixed(1)}%` : 'N/A'}</span></p>
            {/* {result.top_3?.length > 0 && <div className="probabilities">
              <p>Confidence breakdown</p>
              {result.top_3.map((item) => <div className="probability" key={item.category}><span>Quality {item.category}</span><strong>{(item.probability * 100).toFixed(1)}%</strong></div>)}
            </div>} */}
          </>}
        </aside>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
