const helper = require('./helper.js');
const Buffer = require('buffer').Buffer;

const MyNovels = (props) => {
    return (
        <div>
            <div className="box" style={{ minHeight: '100vh' }}>
                <h1 className="title">My Novels:</h1>
                <hr></hr>
                <div id="novel-cards" className="is-flex" style={{ gap: 10 }} >
                </div>
            </div>
        </div>
    );
};

const NovelCard = (props) => {
    console.log(props.novel);
    console.log(props.novel.cover);
    const novel = props.novel;
    const _csrf = props._csrf;

    const buf = Buffer.from(props.novel.cover.data, 'base64');
    const b64String = buf.toString('base64');

    const mimeType = props.novel.coverMime;

    const coverImage = `data:${mimeType};base64,${b64String}`;

    const hoverOnCard = (e) => {
        e.currentTarget.style.width = 250;
    };
    const hoverOffCard = (e) => {
        e.currentTarget.style.width = 200;
    };
    const clickCard = (e) => {
        console.log(`Card clicked: ${e.currentTarget}`);
    };

    return (
        <div className="card" style={{ width: 200 }} onMouseEnter={hoverOnCard} onMouseLeave={hoverOffCard} onClick={clickCard}>
            <div className="card-image">
                <figure className="image is-2by3">
                    <img id={`${props.novel.title}-img`} src={coverImage} alt="Placeholder image" />
                </figure>
            </div>
        </div>
    );
};

const EmptyCard = (props) => {
    const hoverOnCard = (e) => {
        e.currentTarget.style.width = 250;
    };
    const hoverOffCard = (e) => {
        e.currentTarget.style.width = 200;
    };
    const clickCard = (e) => {
        CreateNovel(props);
    };
    return (
        <div className="card" style={{ width: 200 }} onMouseEnter={hoverOnCard} onMouseLeave={hoverOffCard} onClick={clickCard}>
            <div className="card-image">
                <figure className="image is-2by3">
                    <img src="/assets/img/AddCard.png" alt="Placeholder image" />
                </figure>
            </div>
        </div>
    );
};

const loadMyNovels = async (csrf) => {

    const loggedInAsResponse = await fetch('/getLoggedInAs');
    const loggedInAsData = await loggedInAsResponse.json();
    const myUsername = loggedInAsData.username;

    ReactDOM.render(<MyNovels csrf={csrf} />,
        document.getElementById('create-content')
    );

    const gotNovels = (response) => {
        novels = response.novels;
        novels.forEach(novel => {
            const newCardID = novel.title.toLowerCase().replace(' ', '_');
            const newCardDiv = document.createElement('div');
            newCardDiv.id = newCardID;
            document.getElementById('novel-cards').appendChild(newCardDiv);
            //console.log(novel);
            ReactDOM.render(<NovelCard csrf={csrf} novel={novel} />,
                document.getElementById(newCardID)
            );
        });
        const newCardID = 'empty-card';
        const newCardDiv = document.createElement('div');
        newCardDiv.id = newCardID;
        document.getElementById('novel-cards').appendChild(newCardDiv);

        ReactDOM.render(<EmptyCard csrf={csrf} />,
            document.getElementById(newCardID)
        );
    }

    helper.sendPost('/searchNovelsByUser', { user: myUsername, _csrf: csrf }, gotNovels);
}

// Open the Novel Creation Page
const CreateNovel = (props) => {
    const NewNovel = (props) => {

        const setFileInfo = async (e) => {
            const file = e.currentTarget.files[0];
            if (!file) {
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const uploadedImage = reader.result;
                document.querySelector("#coverPreview").src = uploadedImage;
                document.querySelector("#fileName").innerHTML = file.name;
            });
            reader.readAsDataURL(file);
        };

        const gotoLoadMyNovels = () => {
            loadMyNovels(props.csrf);
        }

        return (
            <div>
                <button className="button is-primary is-outlined" onClick={gotoLoadMyNovels}>Back</button>
                <form id="createNovelForm"
                    name="createNovelForm"
                    onSubmit={handleCreateNovel}
                    action="/createNovel"
                    method='POST'
                    className='mainForm box'
                >
                    <div className='title'>
                        <h1>Create A New Novel!</h1>
                    </div>

                    <div className="field">
                        <label className='label' htmlFor='title'>Title: </label>
                        <div className='control has-icons-left'>
                            <input className='input' id="title" type="text" name='title' placeholder='Title' />
                            <span className="icon is-small is-left">
                                <i className="fa-solid fa-book"></i>
                            </span>
                        </div>
                    </div>

                    <div className="field">
                        <label className='label'>Book Cover: </label>
                        <div className="">
                            <div className="file is-boxed has-name is-info">
                                <label className="file-label">
                                    <input className="file-input" id="cover" type="file" name="cover" onChange={setFileInfo} />
                                    <span className="file-cta">
                                        <span className="file-icon">
                                            <i className="fas fa-upload"></i>
                                        </span>
                                        <span className="file-label">
                                            Choose a file…
                                        </span>
                                    </span>
                                    <span id="fileName" className="file-name">
                                        Use a 2:3 aspect ratio
                                    </span>
                                </label>
                            </div>

                            <div className="" style={{ width: 200 }} >
                                <figure className="image is-2by3">
                                    <img id="coverPreview" src="/assets/img/1080x1920.png" alt="Placeholder image" />
                                </figure>
                            </div>
                        </div>
                    </div>

                    <input id='_csrf' type='hidden' name='_csrf' value={props.csrf} />

                    <span id="create-novel-error-span" className='has-text-danger'></span>

                    <div className='control is-pulled-right'>
                        <input className='formSubmit button is-link' type='submit' value='Create' />
                    </div>
                </form >
            </div>
        );
    }

    ReactDOM.render(<NewNovel csrf={props.csrf} />,
        document.getElementById('create-content')
    );
};

handleCreateNovel = (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const coverUpload = document.getElementById('cover');
    const error = document.getElementById('create-novel-error-span');
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!title) {
        error.innerHTML = "Title is required!";
        return;
    }

    const file = coverUpload.files[0];

    if (!file || file === undefined) {
        error.innerHTML = "Cover is required!";
        return;
    }

    const formData = new FormData(document.querySelector("#createNovelForm"));

    const data = {
        _csrf: _csrf,
        formData,
    };

    helper.sendMultipartPost('/createNovel', data, createdNovel);
};

const createdNovel = (response) => {
    loadMyNovels(response.csrfToken);
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();

    loadMyNovels(data.csrfToken);
};

module.exports = {
    init,
}