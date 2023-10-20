const WrapperCards = document.getElementById("wrapper-cards");
const currentPageViewEl = document.getElementById("current-page");
let currentPage = 1;
let currentPageView = Number(currentPageViewEl.innerText);
let characters = []; // 20 personagens
let charactersView = []; // 6 personagens por página
const PER_PAGE = 6;

function resetCards() {
  WrapperCards.innerHTML = "";
}

function setCurrentPageView(newPage) {
  currentPageView = newPage;
  currentPageViewEl.innerHTML = newPage;
}

function addCard(character) {
  WrapperCards.innerHTML += `
<div class="card bg-black bg-opacity-10" style="min-width: 250px; max-width: 350px;">
  <div class="card-body">
    <h5 class="card-title">${character.name}</h5>
    <h6 class="card-subtitle mb-2 text-body-secondary">
      ${character.species}
    </h6>
    <p class="card-text">
      Origem: ${character.origin.name}
    </p>
  </div>
</div>
`;
}

async function fetchCharacters() {
  try {
    const { data } = await api.get("/character?page=" + currentPage);

    characters.push(...data.results);
  } catch (error) {
    console.log(error);
  }
}

async function setView() {
  charactersView = characters.slice(
    (currentPageView - 1) * PER_PAGE,
    currentPageView * PER_PAGE
  );
  if (charactersView.length < PER_PAGE) {
    currentPage++;
    await fetchCharacters();
    charactersView = characters.slice(
      (currentPageView - 1) * PER_PAGE,
      currentPageView * PER_PAGE
    );
  }
  console.log("characters", characters);

  resetCards();
  charactersView.forEach((character) => {
    addCard(character);
  });
}

function nextPage() {
  currentPageView++; // incremento a pagina que o usuário ira ver
  setCurrentPageView(currentPageView);
  setView();
}

function prevPage() {
  currentPageView--;
  setCurrentPageView(currentPageView);
  setView();
}

async function start() {
  await fetchCharacters();
  setView();
}

start();
