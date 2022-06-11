import { useState, useCallback, useEffect } from "react"

const fetchCurrentWeather = ({ authorizationKey, locationName }) => {
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&locationName=${locationName}`)
        .then((response) => response.json())
        .then((data) => {
            console.log('data', data)
            const locationData = data.records.location[0]
            const weatherElements = locationData.weatherElement.reduce(
                (needElements, item) => {
                    if (['WDSD', 'TEMP'].includes(item.elementName)) {
                        needElements[item.elementName] = item.elementValue
                    } return needElements
                }, {}
            );
            return {
                locationName: locationData.locationName,
                windSpeed: weatherElements.WDSD,
                temperature: weatherElements.TEMP,
                observationTime: locationData.time.obsTime,
            }
        })
}

const fetchWeatherForecast = ({ authorizationKey, cityName }) => {
    return fetch(`https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`)
        .then((response) => response.json())
        .then((data) => {
            const locationData = data.records.location[0]
            const weatherElements = locationData.weatherElement.reduce(
                (needElements, item) => {
                    if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
                        needElements[item.elementName] = item.time[0].parameter
                    } return needElements
                }, {})
            return {
                description: weatherElements.Wx.parameterName,
                weatherCode: weatherElements.Wx.parameterValue,
                rainPossibility: weatherElements.PoP.parameterName,
                comfortability: weatherElements.CI.parameterName,
            }
        })
}

const useWeatherAPI = ({ locationName, cityName, authorizationKey }) => {
    const [weatherElement, setWeatherElement] = useState({
        locationName: '',
        description: '',
        windSpeed: 0,
        temperature: 0,
        rainPossibility: 0,
        observationTime: new Date(),
        comfortability: '',
        weatherCode: 0,
        isLoading: true,
    });
    const fetchData = useCallback(
        async () => {
            setWeatherElement((prevState) => ({
                ...prevState,
                isLoading: true,
            }));

            const [currentWeather, weatherForecast] = await Promise.all([
                fetchCurrentWeather({ authorizationKey, locationName }),
                fetchWeatherForecast({ authorizationKey, cityName }),
            ]);

            console.log('Data', currentWeather, weatherForecast)

            setWeatherElement({
                ...currentWeather,
                ...weatherForecast,
                isLoading: false,
            });
        }, [authorizationKey, cityName, locationName]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return [weatherElement, fetchData]
}
export default useWeatherAPI