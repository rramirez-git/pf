// let fecha = new Date(2024, 0, 1); /* yyyy, mm, aa Jan => 0, Feb =>1 */

class Utils {
    static ms_per_day = 24 * 60 * 60 * 1000;
    static add_days(date, days) {
        let ndate = new Date();
        ndate.setTime(date.getTime() + days * Utils.ms_per_day);
        return ndate;
    }
    static fmt_date(date, fmt) {
        let hrs = date.getHours();
        let z = {
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: hrs,
            m: date.getMinutes(),
            s: date.getSeconds(),
            a: hrs < 12 ? 'am' : 'pm',
            H: hrs <= 12 ? hrs : hrs - 12,
            X: Utils.month_name(date),
        };
        fmt = fmt.replace(/(M+|d+|h+|m+|s+|H+)/g, v =>
            ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2));
        fmt = fmt.replace(
            /(y+)/g,
            v => date.getFullYear().toString().slice(-v.length));
        fmt = fmt.replace(/(X+|a+)/g, v => z[v.slice(-1)]);
        return fmt;
    }
    static get_query_var(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(
            results[1].replace(/\+/g, " "));
    }
    static month_name(date) {
        let month = date.toLocaleDateString('es-ES', {month: 'long'});
        return month.substr(0, 1).toUpperCase() + month.substr(1)
    }
    static day_name(date) {
        let month = date.toLocaleDateString('es-ES', {weekday: 'long'});
        return month.substr(0, 1).toUpperCase() + month.substr(1)
    }
    static get_date() {
        let month = parseInt("0" + Utils.get_query_var('mes'));
        let yr = parseInt("0" + Utils.get_query_var('anio'));
        let today = new Date();
        return ((yr && month) || (yr && month === 0))
            ? new Date(parseInt(yr), parseInt(month), 1)
            : (today.getMonth() == 11
                ? new Date(today.getFullYear() + 1, 1, 1)
                : new Date(
                    today.getFullYear(), today.getMonth() + 1, 1));
    }
    static prev_days(date) {
        let prev_days = Array();
        let prev_days_amt = date.getDay() == 0
            ? 6 : (date.getDay() % 7) - 1;
        for(let x = prev_days_amt; x > 0; x--) {
            prev_days.push(Utils.add_days(date, -x));
        }
        return prev_days;
    }
    static async get_actividades(date) {
        let resp = await fetch(`actividades/${date.getFullYear()}_${date.getMonth()}.json`);
        let json_resp = await resp.json();
        return json_resp;
    }
    static get_week_days(days, weekday) {
        return days.filter(
            date => date.getDay() == weekday
            );
    }
}

class Evts {
    static add_enabled_days(array, days) {
        days.forEach(day => array.push({day, 'disabled': false}));
    }
    static add_disabled_days(array, days) {
        days.forEach(day => array.push({day, 'disabled': true}));
    }
    static month_days(date) {
        let month = date.getMonth();
        let day = new Date(date.getFullYear(), month, 1);
        let days = Array();
        while(day.getMonth() == month) {
            days.push(day);
            day = Utils.add_days(day, 1);
        }
        return days;
    }
    static date_range(date_from, total) {
        let days = Array();
        let current_day = new Date(date_from)
        while(days.length <= total) {
            days.push(current_day);
            current_day = Utils.add_days(current_day, 1);
        }
        return days;
    }
    static explode_to_list(events, date) {
        let evts = Array();
        for(let cls in events) {
            let evt = events[cls];
            for(let d of evt.fechas) {
                for(let day of d.dia) {
                    evts.push({
                        'fecha': new Date(
                            date.getFullYear(), date.getMonth(), day,
                            d.hora, d.min),
                        'txt': evt.txt, cls})
                }
            }
        }
        evts.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
        return evts;
    }
    static get_evt_by_date(events, date) {
        return events.filter(
            evt => evt.fecha.getDate() == date.getDate());
    }
}

let set_title = (date, selector, pre_text="Cal-CBKYT-") => {
    let month = Utils.fmt_date(date, "X");
    let yr = Utils.fmt_date(date, "yyyy");
    document.querySelector(selector).textContent = `${month}, ${yr}`;
    document.title = `${pre_text}${month.substr(0, 3)}-${yr.substr(-2)}`;
}

let create_calendar = async () => {

    let fecha = Utils.get_date();
    let days = Array();
    let day_span = document.querySelectorAll(`span.dia-num`);

    set_title(fecha, `div#fecha-letra`);

    Evts.add_disabled_days(days, Utils.prev_days(fecha));
    Evts.add_enabled_days(days, Evts.month_days(fecha));
    Evts.add_disabled_days(days, Evts.date_range(
        Utils.add_days(days[days.length - 1].day, 1),
        day_span.length - days.length - 1));

    let actividades = new Object();
    try {
        actividades = await Utils.get_actividades(fecha)
    } catch(err) { alert(err.message) };

    let eventos = Evts.explode_to_list(actividades, fecha);

    days.forEach((dia_obj, idx) => {
        let span = day_span[idx];
        if(dia_obj.disabled) {
            span.className += ` dia-disabled`;
        } else {
            if(dia_obj.day.getDay() == 0 || dia_obj.day.getDay() == 6) {
                span.className += ` dia-fin-semana`;
            }
            let div = span.parentNode.querySelector(`div`);
            for(let evt of Evts.get_evt_by_date(eventos, dia_obj.day)) {
                let time = evt.fecha.getHours() != 0
                    ? Utils.fmt_date(
                        evt.fecha, evt.fecha.getMinutes() == 0
                        ? "HH a" :"HH:mm a")
                    : "";
                div.innerHTML += `<p class="evento ${evt.cls}">${time} ${evt.txt}</p>`;
            }
            div.innerHTML = `<div>${div.innerHTML}</div>`;
        }
        span.textContent = dia_obj.day.getDate();
    });

};

let load_vars_2_send = () => {
    let month = document.querySelector(`#month`).value;
    document.querySelector(`#mes`).value = parseInt(month.substr(5)) - 1;
    document.querySelector(`#anio`).value = parseInt(month.substr(0, 4));
}

let load_predays = () => {
    let fecha = Utils.get_date();
    set_title(fecha, `h2#fecha-letra`, "Predays-");
    document.querySelector(`#month`).value = Utils.get_query_var("month");
    let days = Evts.month_days(fecha);

    let div = document.querySelector(`#dias`);
    let cad = "";
    for(let x = 0; x < 7; x++) {
        let mdays = Utils.get_week_days(days, x);
        cad += `<p>${mdays[0].getDay()} - ${Utils.day_name(mdays[0])}: ${JSON.stringify(mdays.map(date => date.getDate()))}<p>`;
    }
    div.innerHTML += cad;

    div = document.querySelector(`#actividades`);
    cad = "";
    let actividades = [
        {"actividad": "Programa General 10", "dias": [4]},
        {"actividad": "Programa General 17", "dias": [2, 4]},
        {"actividad": "Programa de Formación de Maestros", "dias": [6]},
        {"actividad": "Programa Fundamental", "dias": [1, 3]},
        {"actividad": "Gema", "dias": [1, 2, 3, 4]},
        {"actividad": "Gema con Tsog", "dias": [0]},
        {"actividad": "Paz Mundial", "dias": [0]},
        {"actividad": "Camino Rápido", "dias": [2]},
        {"actividad": "Camino Gozoso", "dias": [5]}
    ]
    for(let act of actividades) {
        let mdays = Array()
        for(let dy of act.dias) {
            mdays = mdays.concat(Utils.get_week_days(days, dy))
        }
        mdays.sort((a, b) => a.getTime() - b.getTime());
        cad += `<p>${act["actividad"]}: ${JSON.stringify(mdays.map(date => date.getDate()))}<p>`;
    }
    div.innerHTML += cad;
}
