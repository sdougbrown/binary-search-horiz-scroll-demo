import { useState } from 'react'

import Gallery from './objects/Gallery';

import './App.scss'

function App() {

  return (
    <main>
      <div className="app-content">
        <div className="app-content__wrap">
          <h1>Gallery Scrolling</h1>
        </div>
      </div>
      <div className="app-content--alt">
        <div className="app-content__wrap">
          <h3>
            What are we doing here?
          </h3>
          <p className="app-content__wrap--half">{`
            This is an experiment to support manual/native scrolling along with the common
            scroll left/right buttons for desktop. Ideally I can turn this into a standalone module. We'll see.
            `}
          </p>
        </div>
      </div>
      <div className="app-content">
        <div className="app-content__wrap">
          <h3>
            Gallery Demo:
          </h3>
        </div>
        <Gallery />
      </div>

      <div className="app-content--alt">
        <div className="app-content__wrap">
          <h4>Thanks for checking it out!</h4>
        </div>
      </div>
    </main>
  )
}

export default App
