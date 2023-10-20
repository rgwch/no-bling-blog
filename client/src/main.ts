import './app.css'
import './lib/i18n/i18n'
import App from './App.svelte'
import "./lib/store"

const app = new App({
  target: document.getElementById('app'),
})

export default app
