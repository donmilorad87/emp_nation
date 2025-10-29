
/*
  We'll add a 30-min expiry (exp) so rooms won't linger too long on your account.
  See other available options at https://docs.daily.co/reference#create-room
 */


async function createRoom() {
    try {
        await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER }/api/rooms`)
            .then(response => {
                // Check if the response is successful (status code 200-299)
                if (!response.ok) {
                    throw new Error(`Network response was not ok ${response.statusText}`);
                }

                // Parse the response as text (or JSON if the response is in JSON format)
                return response.json(); // Use response.json() if expecting JSON
            })
            .then(async (data) => {
                // Handle the data from the response
                const room = data

                /*  
                        return data */

                const raw = JSON.stringify({
                    "properties": {
                        "is_owner": true
                    }
                });



                await fetch(`${import.meta.env.VITE_APP_BACKEND_SERVER }/api/rooms/meeting-tokens`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: raw,
                })
                    .then((response) => response.json())
                    .then(async (result) => {
                        try {
                            window.tokenz = result.token
                            room.url = `${room.url}?t=${result.token}`


                            window.roomer = room

                            return room


                        } catch (e) {

                            console.error('Error creating room', e);

                        }
                    })
                    .catch((error) => console.error(error));




            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.error('Fetch Error:', error);
            });

    } catch (e) {
        console.error(e);
    }
}

export default createRoom;
