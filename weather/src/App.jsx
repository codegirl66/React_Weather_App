import { useState, useEffect ,useCallback} from "react";
import "./App.css";
import PropTypes from "prop-types";

import cloudIcon from "./assets/cloud.png";
import drizzleIcon from "./assets/drizzle.png";
import rainIcon from "./assets/rainy.png";
import searchIcon from "./assets/search.png";
import snowIcon from "./assets/snow.gif";
//import sunIcon from "./assets/Sun.png";
import sunIcon2 from "./assets/sun2.png";
import windIcon from "./assets/wind.gif";
import humidityIcon from "./assets/humidity.jpg";

const WeatherDetails = ({
  icon,
  temp,
  city,
  country,
  lat,
  log,
  humidity,
  wind,
}) => {
  return (
    <>
      <div className="image">
        <img src={icon} alt="Image" />
      </div>
      <div className="temp">{temp}°C</div>
      <div className="location">{city}</div>
      <div className="country">{country}</div>
      <div className="cord">
        <div>
          <span className="lat">Latitude</span>
          <span>{lat}</span>
        </div>
        <div>
          <span className="log">Longitude</span>
          <span>{log}</span>
        </div>
      </div>
      <div className="data-container">
        <div className="element" id="humidity-icon">
          <img src={humidityIcon} alt="humidity" className="icon" />
          <div className="data">
            <div className="humidity-percent">{humidity}%</div>
            <div className="text">Humidity</div>
          </div>
        </div>
        <div className="element">
          <img src={windIcon} alt="wind" className="icon" />
          <div className="data">
            <div className="wind-percent">{wind} km/hr</div>
            <div className="text">Wind Speed</div>
          </div>
        </div>
      </div>
    </>
  );
};
WeatherDetails.propTypes = {
  icon: PropTypes.string.isRequired,
  temp: PropTypes.number.isRequired,
  city: PropTypes.string.isRequired,
  country: PropTypes.string.isRequired,
  humidity: PropTypes.number.isRequired,
  wind: PropTypes.number.isRequired,
  lat: PropTypes.number.isRequired,
  log: PropTypes.number.isRequired,
};
const weatherIconMap = {
    "01d": sunIcon2,
    "01n": sunIcon2,
    "02d": cloudIcon,
    "02n": cloudIcon,
    "03d": drizzleIcon,
    "03n": drizzleIcon,
    "04d": drizzleIcon,
    "04n": drizzleIcon,
    "09d": rainIcon,
    "09n": rainIcon,
    "10d": rainIcon,
    "10n": rainIcon,
    "13d": snowIcon,
    "13n": snowIcon,
  };

function App() {
  let api_key = import.meta.env.VITE_WEATHER_API_KEY;
  const [text, setText] = useState("Chennai");

  const [icon, setIcon] = useState(snowIcon);
  const [temp, setTemp] = useState(0);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState(0);
  const [log, setLog] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [wind, setWind] = useState(0);

  const [cityNotFound, setCityNotFound] = useState(false); //if city we enteres wrongly it will handle
  const [loading, setLoading] = useState(false); //wait until data fetch
  const [error, setError] = useState(null);
  const [background, setBackground] = useState("default-bg");
  

  const search = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCityNotFound(false);
    //async because it becomes take time to fetch data using api
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${text}&appid=${api_key}&units=metric`;
    try {
      let res = await fetch(url);
      let data = await res.json();

      if (data.cod === 404) {
        //error message displayed in console
        console.log("City not found");
        setCityNotFound(true);

        //Clear previous data
        setCity(""); //changed
        setCountry("");
        setLat(0);
        setLog(0);
        setHumidity(0);
        setWind(0);
        setTemp(0);
        setIcon(sunIcon2);
        setBackground("default-bg");
        setLoading(false);
        setText("");
        return; //don't do further action because the entered city is wrong
      }

      //check postman
      setHumidity(data.main.humidity);
      setWind(data.wind.speed);
      setTemp(Math.floor(data.main.temp)); //because ans results in decimal
      setCity(data.name);
      setCountry(data.sys.country);
      setLat(data.coord.lat);
      setLog(data.coord.lon);

      const weatherIconCode = data.weather[0].icon;
      setIcon(weatherIconMap[weatherIconCode] || sunIcon2);
      const weatherMain = data.weather[0].main.toLowerCase();
      if (weatherMain.includes("cloud")) {
        setBackground("cloudy-bg");
      } else if (weatherMain.includes("rain")) {
        setBackground("rainy-bg");
      } else if (weatherMain.includes("clear")) {
        setBackground("sunny-bg");
      } else if (weatherMain.includes("snow")) {
        setBackground("snowy-bg");
      } else {
        setBackground("default-bg");
      }
      setCityNotFound(false);
    } catch (error) {
      console.error("An error occured", error.message);
      setError("City not found."); //try with specific name
    } finally {
      setLoading(false);
    }
  },[text,api_key]);

  const handleCity = (e) => {
    setText(e.target.value);
    setError(null);
    setCityNotFound(false); //changed
    setCity("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      //if search bar pressed or entered it will render
      search();
    }
  };

  useEffect(function () {
    //atleast once search button called
    search();
  }, [search]); //whenever the app get mount
  return (
    <>
      <div className={`container ${background}`}>
        <div className="input-container">
          <input
            type="text"
            className="cityInput"
            placeholder="Search city"
            onChange={handleCity}
            value={text}
            onKeyDown={handleKeyDown}
          />
          <div className="search-icon" onClick={() => search()}>
            <img src={searchIcon} alt="search" className="search-img"></img>
          </div>
        </div>

        {loading && <div className="loading-message">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {cityNotFound && <div className="city-not-found">City not found</div>}

        {!loading &&
          !cityNotFound &&
          !error &&
          city && ( //changed
            <WeatherDetails
              icon={icon}
              temp={temp}
              city={city}
              country={country}
              lat={lat}
              log={log}
              humidity={humidity}
              wind={wind}
            />
          )}
        <p className="copyright">
          Designed by <span>Priyadharshini</span>
        </p>
      </div>
    </>
  );
}

export default App;
