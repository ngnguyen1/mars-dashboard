const API_URL = 'http://localhost:3000'

let store = Immutable.Map({
  user: Immutable.Map({ name: 'Student' }),
  apod: '',
  // There are 4 rovers available: curiosity, opportunity, spirit, perseverance
  // but only 2 are in active at the moment are curiosity and perseverance.
  // Completed rover missions are opportunity and spirit and the image will be
  // redirected to the link
  rovers: Immutable.List(['curiosity', 'perseverance']), 
  currentRover: 'none'
})


const root = document.getElementById('root')

const updateStore = (state, newState) => {
  store = state.merge(newState)
  render(root, store)
}

const render = async (root, state) => {
  root.innerHTML = App(state)
}

const App = (state) => {
  const item = state.get('currentRover');
  if (item === 'none')  {
    return (`
      <header>
        <div class="navbar">
          <div class="logo" onclick="backHome(event)">
            <a href="#"><img src="./assets/images/rover.png" alt="Rover icon"></a>
            <p class="title-logo">Mars Dashboard</p>
          </div>
        </div>
      </header>
      <div class="container"">
        <div class="wrapper-dashboard">
          <div class="title-dashboard">Explore the Mars Rovers</div>		
          ${renderList(state)}
        </div>
      </div>
    `)
  } else {
    return (`
      <header>
        <div class="navbar">
          <div class="logo" onclick="backHome(event)">
            <a href="#"><img src="./assets/images/rover.png" alt="Rover icon"></a>
          </div>
          <ul class="items-navbar">${renderListItems(state)}<ul>
        </div>
      </header>
      <div class="container-info">
        <span class="rover-title">The <span>${item.latest_photos[0].rover.name}</span> Rover</span>	
        <div class ="rover-data">
          <p><span>Launch date:</span> ${item.latest_photos[0].rover.launch_date}</p>
          <p><span>Landing date:</span> ${item.latest_photos[0].rover.landing_date}</p>
          <p><span>Mission status:</span> <b>${capitalize(item.latest_photos[0].rover.status)}</b></p>
        </div>
        <div class="gallery">${imageGallery(state)}</div>
      </div>
    `)
  }
}

window.addEventListener('load', () => {
  render(root, store)
})

const renderList = (state) => {
  return `<ul class="wrapper-tiles">${renderRoverTile(state)}</ul>`
}

const renderRoverTile = (state) => {
  return state.get('rovers').map(item => {
    const capitalizedItem = capitalize(item);
    return `
      <li id="${item}" class="tile" onclick="viewRoverImages(event)">
        <a href="#" class="">${capitalizedItem}</a>
      </li>
    `;
  }).join("");
}

const renderListItems = (state) => {
  return Array.from(state.get('rovers')).map( item => 
    `<li id=${item} class="" onclick="viewRoverImages(event)">
      <a ref="#" class="">${capitalize(`${item}`)}</a>
    </li>`
  ).join("")
}

const imageGallery = (state) => {
  const currentRover = state.get('currentRover');
  const latestPhotos = currentRover.latest_photos;

  return latestPhotos.slice(0, 50).map(photo => 
    `<div class="wrapper">
      <img src="${photo.img_src}" alt="${photo.id}" />
      <div class="wrapper-info">
        <p><span>Date:</span> ${photo.earth_date}</p>
      </div>
    </div>`
  ).join("");
}

const viewRoverImages = event => {
  const { id } = event.currentTarget; 
  const rovers = store.get('rovers').toArray();

  if (rovers.includes(id)) {
    getRoverImages(id, store);
  } else {
    console.log('Rover not available');
  }
}


const backHome = _ => {
  resetCurrentRover();
}

const resetCurrentRover = () => {
  const newState = store.set('currentRover', 'none');
  updateStore(store, newState);
}

const capitalize = word => {
  return `${word[0].toUpperCase()}${word.slice(1)}`
}

const getRoverImages = async (roverName, state) => {
  try {
    const response = await fetch(`${API_URL}/rovers/${roverName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch rover images: ${response.statusText}`);
    }
    const currentRover = await response.json();
    const newState = state.set('currentRover', currentRover);
    updateStore(state, newState);
    return currentRover;
  } catch (error) {
    console.error('Error fetching rover images:', error);
  }
}