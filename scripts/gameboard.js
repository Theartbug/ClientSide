'use strict';

app = app || {};

(function(module) {
    const gameboard = {};

    gameboard.startGame = () => {
        app.Card.shuffle(app.Card.duplicatePokes);
        for (let i = 0; i < app.Card.duplicatePokes.length; i++) {
            $('.cards').append(app.Card.duplicatePokes[i].toHtml('#card-template'));
        }
        for (let i = 0; i < app.Card.all.length; i++) {
            gameboard.getPokemondex_entry(app.Card.all[i].dex_number);
        }

        app.Card.flip();

        //TODO Set event listeners to the cards for flipping, matching, flipback. Not sure if they should be prototypes on the card or functions of the gameboard?
        //TODO start timer.
    };

    gameboard.endGame = () => {
        const timer = $('.timer').text();
        if ($('.match').length === app.Card.duplicatePokes.length || timer == '00:00') {
            const endGameHeader = $('#end-game-greeting');
            const scoreShow = $('#score-show');
            const score = $('.score span').text();
            setTimeout(function() {
                endGameHeader.addClass('select'); // reset flex direction
                if ($('.match').length === app.card.duplicatePokes.length) {
                    $('#name-save').show();
                    endGameHeader.text('You Win! Save Your Score?');
                    scoreShow.text(`Your Score is ${score}`);
                } // all matched
                if (timer === '00:00') { // if timer ran out
                    endGameHeader.text('Time Out!');
                } // timer ran out
                // app.leaderboard.setScore(); TODO leaderboard
            }, 2300); // settimeout for fades
        } // if

        // TODO set event listeners for form submission, play again button
        // TODO call for pokemon matches view
    };

    gameboard.clear = () => {
        $('.cards').empty();
        app.Card.all = [];
        app.Card.duplicatePokes = [];
        $('.score span').text(0);
    };

    gameboard.getPokemonByType = (type, cb) => {
        $.get(`${API_URL}/pokemon/${type}`) //API_URL is defined in the index.html prior to all scripts. linter lies.
            .then(pokemon => {
                app.Card.loadAll(pokemon);
                app.Card.duplicateAll();
            })
            .then(() => {
                if (cb) cb();
            }); // callback view.initGamePage
    };

    gameboard.getPokemondex_entry = (dexNo) => {
        $.get(`${API_URL}/pokemonspecies/${dexNo}`)
            .then(dex_entry => {
                //maybe use .replace(/\r/g, "") to get rid of \n
                app.Card.findMatchingPokemonToDex(dex_entry, dexNo);
            });
    };

    gameboard.setTime = (duration, display) => {
        let timer = duration, minutes, seconds;
        const interval = setInterval(function() {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;

            display.text(`${minutes}:${seconds}`);

            if (--timer < 0 || $('.match').length === app.card.cardsArray.length) {
                clearInterval(interval); // fix timer continuing
                gameboard.endGame();
            } // if
        }, 1000); //interval
    };

    gameboard.updateScore = (points) => {
        const score = $('.score span');
        if (parseInt(score) == 0 && points > 0) {
            score.text(parseInt(points));
        } // doesn't let score dip below 0

        else if (parseInt(score.text()) != 0) {
            score.text(parseInt(score.text()) + parseInt(points));
        } // when score is not 0

        if ($('.match').length === app.Card.duplicatePokes.length) { // add left over time if win
            score.text(parseInt(score.text()) + gameboard.timeScore());
        }

    };


    gameboard.timeScore = () => {
        const timeLeft = $('.timer').text();
        let convertedTime;

        convertedTime = parseInt(timeLeft.charAt(3) + timeLeft.charAt(4));
        convertedTime += (parseInt(timeLeft.charAt(1)) * 60);

        return convertedTime;
    };

    module.gameboard = gameboard;

})(app);
