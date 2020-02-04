class Schedule {
    constructor(schedule) {
        this.name = schedule.name;
        this.bells = [];
        this.isBreak = false;
        this.enabled = false;
        schedule.periods.forEach((period) => {
            let startTime = new Date();
            startTime.setHours(period.startTime.split(':')[0], period.startTime.split(':')[1],0);
            let endTime = new Date();
            endTime.setHours(period.endTime.split(':')[0], period.endTime.split(':')[1],0);
            this.bells.push({
                "name": period.name,
                "id": period.name.replace(' ', '-').replace('"',''),
                "startTime": startTime,
                "endTime": endTime
            });
        })
    }
    setup() {
        let d = new Date();
        let bellsContainer = document.getElementById("bells");
        this.bells.forEach((bell) => {
            bellsContainer.appendChild(stringToNode(`
                <div class="panel-block">
                    <div class="container">
                    <div>
                        ${bell.name}
                    </div>
                    <nav class="level">
                        <div class="level-left">
                        <div class="level-item">
                            ${bell.startTime.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        </div>
                        <progress id="${bell.id}" class="progress is-danger is-small has-margins" value="0" max="${bell.endTime - bell.startTime}"></progress>
                        <div class="level-right">
                        <div class="level-item">
                            ${bell.endTime.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        </div>
                    </nav>
                    </div>
                </div>`));
            let bellElement = document.getElementById(bell.id);
            if (bell.endTime < d)
                bellElement.value = bell.endTime - bell.startTime;
            else
                bellElement.value = d - bell.startTime;

        });
    }
    currentPeriod() {
        let i = 0;
        let d = new Date();
        if (d > this.bells[this.bells.length - 1].endTime) {
            disable();
            return this.bells[this.bells.length - 1];
        }
        while (d > this.bells[i].endTime) { i++;}
        return this.bells[i];
    }
    enable() {
        if(this.enabled) return;
        this.enabled = true;
        let d = new Date();
        if (d > this.bells[this.bells.length - 1].endTime)
            return this.bells[this.bells.length - 1];
        this.cPeriod = this.currentPeriod();
        if (this.cPeriod.startTime > d) {
            this.isBreak = true;
            this.to = setTimeout((function(scope){return function(){scope.ringBell();};})(this), this.cPeriod.startTime - d);
        } else {
            this.isBreak = false;
            this.to = setTimeout((function(scope){return function(){scope.ringBell();};})(this), this.cPeriod.endTime - d);
        }
        this.int = setInterval((function(scope){return function(){scope.updateBar();};})(this), 1000);
    }
    disable() {
        this.enabled = false;
        clearTimeout(this.to);
        clearInterval(this.int);
    }
    ringBell() {
        audio.play();
        setTimeout(function () { audio.pause(); audio.currentTime = 0; }, 2000)
        this.cPeriod = this.currentPeriod();
        if (this.isBreak) {
            this.isBreak = false;
            this.to = setTimeout((function(scope){return function(){scope.ringBell();};})(this), this.cPeriod.endTime - new Date());
        } else {
            this.isBreak = true;
            this.to = setTimeout((function(scope){return function(){scope.ringBell();};})(this), this.cPeriod.startTime - new Date());
        }
    }
    updateBar() {
        if(this.isBreak) return;
        document.getElementById(this.currentPeriod().id).value = new Date() - this.cPeriod.startTime;
    }
}