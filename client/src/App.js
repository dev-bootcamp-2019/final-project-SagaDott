import React, { Component } from "react";
import WelcomeView from "./Views/WelcomeView";
import InfoView from "./Views/InfoView";
import InteractiveView from "./Views/InteractiveView";

import "./App.css";
import 'typeface-roboto';



class App extends Component {
  render() {
    return (
      <div>

        <InteractiveView />
      </div>
    );
  }
}

export default App;


//<div> App! </div>
//<WelcomeView />
//<InfoView />
