Netlify Link: https://willowy-bonbon-7879e7.netlify.app/

Backend Language Used: Python, running on Render

JSON persistence occurs because the backend is hosted on Render, and so while that server isn't restarted, the JSON file on the server-side will persist. However, the server goes to sleep
after a period of inactivity, so the first load up after a long period of time might take a while.
