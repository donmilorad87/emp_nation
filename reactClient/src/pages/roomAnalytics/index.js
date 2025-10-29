import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify'
import { useSelector } from "react-redux";
import './index.scss'
import Loader from "../../components/Loader/Loader";
import { TriangleToLeft } from "./icons";
const RoomAnalytics = () => {


    const loggedUser = useSelector(
        (state) => state.reducer.user
    );

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filteredData, setFilteredData] = useState(null);

    const [minDate, setMinDate] = useState(null);
    const [minHelpDate, setMinHelpDate] = useState(null);
    const [maxHelpDate, setMaxHelpDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);

    const [timeZoneOffset, setTimeZoneOffset] = useState(window.timeZoneOffse ?? 0);

    const [changeTimeZonePopup, setChangeTimeZonePopup] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const token = loggedUser?.token
        const myHeaders = new Headers();
        if (token) myHeaders.append("Authorization", "Bearer " + token);
        myHeaders.append("Content-Type", "application/json");


        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        let loaddialog = document.getElementById("loadingDialog");
        loaddialog.showModal();

        fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER}/api/rooms/room_sesions`, requestOptions)
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                setData(data.data);
                setFilteredData(data.data);
                setLoading(false);
                setMinDate(new Date(data.data[data.data.length - 1].start_time * 1000).toISOString().split('T')[0]);
                setMaxDate(new Date(data.data[0].start_time * 1000).toISOString().split('T')[0]);

            })
            .catch((err) => {
                setError(err);
                setLoading(false);
            });




    }, []);

    function formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        // Format the output as "HH:mm:ss"
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    function calculateEndTime(startTime, seconds) {
        const dateObj = new Date(startTime * 1000);

        // Add the seconds to the Date object
        dateObj.setSeconds(dateObj.getSeconds() + seconds);

        // Return the new date as a string
        return extractDate(dateObj.getTime(), true);

    }
    const extractDate = (date, multiplied) => {

        const timestampInMilliseconds = date * (multiplied ? 1 : 1000); // Convert to milliseconds
        const d = new Date(timestampInMilliseconds);
        const formattedDate = d.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        return formattedDate;


    }

    if (loading) return <Loader />
    if (error) return <div>Error: {error.message}</div>;

    const openParticipantsTable = (e) => {
        if (e.currentTarget.dataset.closed === "1") {



            e.currentTarget.querySelector('svg').style.rotate = '0deg'

            let dataIdentifier = e.currentTarget.dataset.identifier



            document.querySelector(`.${dataIdentifier}`).classList.add('closedInerTable')
            setTimeout(() => {
                document.querySelector(`.${dataIdentifier}`).style.display = 'none'
            }, 331);

            e.currentTarget.dataset.closed = "0"
        } else if (e.currentTarget.dataset.closed === "0") {

            let svgs = document.querySelectorAll('.tableAnalytics svg');

            for (let i = 0; i < svgs.length; i++) {
                svgs[i].style.rotate = '0deg'
                svgs[i].parentElement.parentElement.dataset.closed = "0"
            }

            e.currentTarget.querySelector('svg').style.rotate = '90deg'

            let dataIdentifier = e.currentTarget.dataset.identifier
            console.log(dataIdentifier, document.querySelector(`.${dataIdentifier}`));
            let inerTables = document.getElementsByClassName('innerTable');

            for (let i = 0; i < inerTables.length; i++) {
                inerTables[i].classList.add('closedInerTable')
                inerTables[i].style.display = 'none'
            }

            document.querySelector(`.${dataIdentifier}`).style.display = 'table'

            setTimeout(() => {
                document.querySelector(`.${dataIdentifier}`).classList.remove('closedInerTable')
            }, 1);

            e.currentTarget.dataset.closed = "1"
        }



    }

    const filterData = () => {
        console.log('prr');

        if (new Date(document.getElementById('fromDate').value) > new Date(document.getElementById('toDate').value)) {
            toast.error("From date can't be greater than to date");
            document.getElementById('fromDate').classList.add('error');
            setTimeout(() => {
                document.getElementById('fromDate').classList.remove('error');
            }, 5000)
            return
        }

        /* if (document.getElementById('fromDate').value === document.getElementById('toDate').value) {
            toast.error("From date can't be equal than to date");
            document.getElementById('fromDate').classList.add('error');
            document.getElementById('fromDate').classList.add('toDate');
            setTimeout(() => {
                document.getElementById('fromDate').classList.remove('error');
                document.getElementById('toDate').classList.remove('error');
            }, 5000)
            return
        } */
        document.getElementById('fromDate').classList.remove('error');
        document.getElementById('toDate').classList.remove('error');

        setMinHelpDate(document.getElementById('fromDate').value);
        setMaxHelpDate(document.getElementById('toDate').value);

        const deepClone = data.map(item => {
            return { ...item, start_time: calculateDateWithTimezoneOffset(item.start_time, timeZoneOffset) };  // 
        });

        const filteredData = deepClone.filter((item) => {
            const itemDate = new Date(item.start_time * 1000);


            return itemDate >= new Date(document.getElementById('fromDate').value) && itemDate <= new Date(document.getElementById('toDate').value + ' 23:59:59');
        });



        setFilteredData(filteredData);

    }

    const changeTimezone = () => {
        console.log('prrcs');

        setChangeTimeZonePopup(true);
        document.addEventListener('mousedown', handleClickOutside);
        window.clickedPopupButClose = false


    }
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setChangeTimeZonePopup(false);
        }
    };
    function calculateDateWithTimezoneOffset(microtime, offsetMinutes) {
        const timeInMillis = microtime * 1000;

        // Create a new Date object based on the microtime
        const date = new Date(timeInMillis);
        console.log('1', date, offsetMinutes);
        // Adjust the date based on the offset in minutes
        // Offset is in minutes, so we convert it to milliseconds
        const offsetMillis = offsetMinutes * 60 * 1000;

        // Add the offset to the date
        date.setTime(date.getTime() + offsetMillis);
        console.log('2', date, offsetMinutes);
        const newMicrotime = Math.floor(date.getTime() / 1000); // Convert to seconds

        return newMicrotime;
    }


    const setTimeZone = (e) => {
        console.log(data);
        let timeZoneOptions = document.querySelectorAll('.timeZoneOption');

        for (let i = 0; i < timeZoneOptions.length; i++) {
            timeZoneOptions[i].classList.remove('selected');
        }
        e.currentTarget.classList.add('selected');

        setTimeZoneOffset(e.currentTarget.dataset.offset)

        const deepClone = data.map(item => {
            return { ...item, start_time: calculateDateWithTimezoneOffset(item.start_time, e.currentTarget.dataset.offset) };  // 
        });

        const filteredData = deepClone.filter((item) => {
            const itemDate = new Date(item.start_time * 1000);


            return itemDate >= new Date(document.getElementById('fromDate').value) && itemDate <= new Date(document.getElementById('toDate').value + ' 23:59:59');
        });

        setFilteredData(filteredData);


    }

    return (
        <>


            <div className="whiteFrame w-100">
                <div className="analyticsHeader">
                    <h1>Meeting Usage Report</h1>

                    <div className="searchBox">
                        <div className="searchInputs">
                            <div className="input">
                                <label htmlFor="fromDate">From:</label>
                                <input type="date" name="fromDate" id="fromDate" min={minDate} max={maxDate} onInput={filterData} value={minHelpDate ? minHelpDate : minDate} />
                            </div>
                            <div className="input">
                                <label htmlFor="toDate">To:</label>
                                <input type="date" name="toDate" id="toDate" min={minDate} max={maxDate} onInput={filterData} value={maxHelpDate ? maxHelpDate : maxDate} />
                            </div>


                        </div>
                        <div className="buttonsContainer">
                            <button className="classAnalyticsButton" onClick={filterData}>Search</button>
                            <div onClick={changeTimezone}>
                                <button className="classAnalyticsButton" >Change TimeZone</button>

                                {changeTimeZonePopup && (

                                    <div ref={dropdownRef} className="dropdown-menu">
                                        <div className="bb1 pb1">
                                            <p>Set</p>
                                            <h4>TimeZone</h4>
                                        </div>
                                        <div className={`timeZoneOption ${timeZoneOffset == -300 ? 'selected' : ''}`} onClick={setTimeZone} data-offset="-300">
                                            <h4>ET</h4>
                                            <p>Eastern Time Zone</p>
                                            <p>UTC-05:00</p>
                                        </div>
                                        <div className={`timeZoneOption ${timeZoneOffset == -360 ? 'selected' : ''}`} onClick={setTimeZone} data-offset="-360">
                                            <h4>CT</h4>
                                            <p>Central Time Zone</p>
                                            <p>UTC-06:00</p>
                                        </div>
                                        <div className={`timeZoneOption ${timeZoneOffset == -420 ? 'selected' : ''}`} onClick={setTimeZone} data-offset="-420">
                                            <h4>MT</h4>
                                            <p>Mountain Time Zone</p>
                                            <p>UTC-07:00</p>
                                        </div>
                                        <div className={`timeZoneOption ${timeZoneOffset == -480 ? 'selected' : ''}`} onClick={setTimeZone} data-offset="-480">
                                            <h4>PT</h4>
                                            <p>Pacific Time Zone</p>
                                            <p>UTC-08:00</p>
                                        </div>
                                        <div className={`timeZoneOption bt1 pt1 ${timeZoneOffset == 0 ? 'selected' : ''}`} onClick={setTimeZone} data-offset="0">
                                            <h4>UTC</h4>
                                            <p>Coordinated</p>
                                            <p>Universal Time</p>
                                        </div>
                                    </div>

                                )}
                            </div>


                        </div>
                    </div>

                </div>
                <table className="tableAnalytics w-100">
                    <thead>
                        <tr>
                            <td className="dnRes"></td>
                            <th id="DateTime" scope="col">Date Time</th>
                            <th id="roomId" scope="col">Room ID</th>
                            <th id="sessionId" scope="col">Session ID</th>
                            <th id="ownerUserName" scope="col">Owner User Name</th>
                            <th id="creatingTime" scope="col">Creating Time</th>
                            <th id="startTime" scope="col">Start Time</th>
                            <th id="endTime" scope="col">End Time</th>
                            <th id="duration" scope="col">Duration</th>
                            <th id="participants" scope="col">Participants</th>
                        </tr>

                    </thead>
                    <tbody>
                        {
                            filteredData.map((item, index) => {
                                return (
                                    <>
                                        <tr onClick={openParticipantsTable} className="analyticsTableItems" data-closed="0" data-identifier={'m' + item.id}>
                                            <td className="dnRes"><TriangleToLeft /></td>
                                            <td id="DateTime" data-title="Date Time">{extractDate(item.start_time)}</td>
                                            <td id="roomId" data-title="Room ID"><div className="eclipsed">{item.room}</div></td>
                                            <td id="sessionId" data-title="Session ID"><div className="eclipsed">{item.id}</div></td>
                                            <td id="ownerUserName" data-title="Owner User Name">{loggedUser.user.username}</td>
                                            <td id="creatingTime" data-title="Creating Time">{extractDate(item.start_time)}</td>
                                            <td id="startTime" data-title="Start Time">{extractDate(item.start_time)}</td>
                                            <td id="endTime" data-title="End Time">{calculateEndTime(item.start_time, item.duration)}</td>
                                            <td id="duration" data-title="Duration">{formatDuration(item.duration)}</td>
                                            <td id="participants" data-title="Participants">{item.max_participants}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="10" className="bb0 p0">
                                                <table className={`w-100 innerTable closedInerTable m${item.id}`} style={{ display: 'none' }}>
                                                    <thead>
                                                        <tr>
                                                            <th className="bb0"></th>
                                                            <th id="participantId" scope="col">Participant ID</th>
                                                            <th id="type" scope="col">Type</th>
                                                            <th id="joinTime" scope="col">Join Time</th>
                                                            <th id="leaveTime" scope="col">Leave Time</th>
                                                            <th id="duration" scope="col">Duration</th>
                                                            <th id="browser" scope="col">Browser</th>
                                                            <th id="operatingSystem" scope="col">Operating System</th>
                                                            <th id="status" scope="col">Status</th>
                                                        </tr>

                                                    </thead>
                                                    <tbody>
                                                        {
                                                            item.participants.map((participant, index) => {
                                                                return (
                                                                    <>
                                                                        <tr>
                                                                            <td className="bb0 bbSpecial" data-title="Participant Number">{index + 1 + '. '}</td>
                                                                            <td className="bb0" id="participantId" data-title="Participant ID">{participant.participant_id}</td>
                                                                            <td className="bb0" id="type" data-title="Type"><div className="eclipsed">{participant.user_id}</div></td>
                                                                            <td className="bb0" id="joinTime" data-title="Join Time">{extractDate(participant.join_time)}</td>
                                                                            <td className="bb0" id="leaveTime" data-title="Leave Time">{calculateEndTime(participant.join_time, participant.duration)}</td>
                                                                            <td className="bb0" id="duration" data-title="Duration">{formatDuration(participant.duration)}</td>
                                                                            <td className="bb0" id="browser" data-title="Browser">{participant.user_id}</td>
                                                                            <td className="bb0" id="operatingSystem" data-title="Operating System">{participant.user_id}</td>
                                                                            <td className="bb0" id="status" data-title="Status">{formatDuration(participant.duration)}</td>

                                                                        </tr>

                                                                    </>


                                                                )
                                                            })
                                                        }
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    </>
                                )
                            })
                        }

                    </tbody>

                </table>
            </div>



            <ToastContainer />
        </>

    )
}

export default RoomAnalytics