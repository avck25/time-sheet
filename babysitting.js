/* global $*/
(function () {
    'use strict';
    var form = $('#theForm'),
        formDiv = $('#theFormDiv'),
        client,
        addAName = true,
        yes = $('#yes'),
        no = $('#no'),
        response = $('#response'),
        responsetext = $('#responseText'),
        calculate = $('#calculate'),
        individualCal = $('#individualCal'),
        calculateHours = $('#calculateHours'),
        daysArray = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    function createFormData() {
        return `<div class="form-group"><label class="control-label" for="name">Name</label>
            <input class="form-control " id="name" type="text"></div>
            <div class="form-group" id="M-T"><label id="header" class="control-label">M-T</label>
            <label class="control-label" for="startTimeReg">Start Time</label>
            <input class="form-control " id="startTimeReg" type="time">
            <label class="control-label " for="endTimeReg">End Time</label>
            <input class="form-control" id="endTimeReg" type="time"></div>
            <div class="form-group" id="friday"><label id="header" class="control-label">friday</label>
            <label class="control-label" for="startTimeFri">Start Time</label>
            <input class="form-control" id="startTimeFri" type="time">
            <label class="control-label " for="endTimeFri">End Time</label>
            <input class="form-control " id="endTimeFri" type="time"></div>
            <div class="form-group" id="special"><label id="header" class="control-label">special day</label>
            <label class="control-label" for="specialDay">Day</label>
            <input class="form-control" id="specialDay" type="text">
            <label class="control-label" for="startTimeSpecial">Start Time</label>
            <input class="form-control" id="startTimeSpecial" type="time">
            <label class="control-label " for="endTimeSpecial">End Time</label>
            <input class="form-control" id="endTimeSpecial" type="time"></div>`;
    }

    function hrsAndMin(time1, time2) {
        var time1Array = time1.split(':');
        var time2Array = time2.split(':');

        var date1 = new Date();
        var date2 = new Date();

        date1.setHours(time1Array[0]);
        date1.setMinutes(time1Array[1]);

        date2.setHours(time2Array[0]);
        date2.setMinutes(time2Array[1]);

        var calculation = date2 - date1;

        var hours = Math.floor(((calculation / 1000) / 60) / 60);
        var minutes = Math.floor(((calculation / 1000) / 60) % 60);

        return {
            hours: hours,
            minutes: minutes
        };

    }

    function calculation(regDay, friday, missed, extraMinutes, special) {
        var hours,
            minutes,
            total;
        if (special.hours !== null) {
            hours = (regDay.hours * 6) + (special.hours * 2) + (friday.hours * 2);
            minutes = (regDay.minutes * 6) + (special.minutes * 2) + (friday.minutes * 2);
        } else {
            hours = (regDay.hours * 8) + (friday.hours * 2);
            minutes = (regDay.minutes * 8) + (friday.minutes * 2);
        }

        if (missed) {
            hours -= missed.hours;
            minutes -= missed.minutes;
        }

        if (extraMinutes) {
            minutes += extraMinutes;
        }

        hours += Math.floor(minutes / 60);
        minutes = Math.floor(minutes % 60);
        total = hours * 5;
        total += (5 / 60) * minutes;

        return {
            totalHours: hours,
            totalMinutes: minutes,
            totalDue: total
        };

    }

    function missed(select, data) {
        var hours = 0,
            min = 0;
        if (typeof (select) === 'string') {
            select = select.split(' ');
        }

        select.forEach(function (day) {
            if (day === data.specialDay) {
                hours += (data.specialHours * 1);
                min += (data.specialMin * 1);

            } else if (day === 'friday') {
                hours += (data.fridayHours * 1);
                min += (data.fridayMin * 1);

            } else {
                hours += (data.regDayHours * 1);
                min += (data.regDayMin * 1);

            }
        });

        return {
            missedHours: hours,
            missedMin: min
        };

    }

    $('#addClient').click(function () {
        responsetext.empty();
        response.hide();
        if (addAName) {
            form.append(createFormData());
            formDiv.css('display', 'block');
            addAName = false;
        }
    });
    $('#submit').click(function () {
        /*console.log('hello', $('#startTimeReg').val(), $('#endTimeReg').val());
        console.log(hrsAndMin($('#startTimeReg').val(), $('#endTimeReg').val()));*/
        var name = $('#name'),
            startTimeReg = $('#startTimeReg'),
            endTimeReg = $('#endTimeReg'),
            startTimeFri = $('#startTimeFri'),
            endTimeFri = $('#endTimeFri'),
            startTimeSpecial = $('#startTimeSpecial'),
            endTimeSpecial = $('#endTimeSpecial');
        if (!name.val() || !startTimeReg.val() || !endTimeReg.val() || !startTimeFri.val() || !endTimeFri.val()) {
            alert('must have times for M-T and Friday');
        } else {
            client = {
                name: name.val(),
                regularDay: hrsAndMin(startTimeReg.val(), endTimeReg.val()),
                friday: hrsAndMin(startTimeFri.val(), endTimeFri.val())
            };
            if (startTimeSpecial.val() && endTimeSpecial.val()) {
                client.specialDay = {
                    day: $('#specialDay').val(),
                    hrsAndMin: hrsAndMin(startTimeSpecial.val(), endTimeSpecial.val())
                };
            }

        }



        $.post('utils/insertClient.php', { client: client }, function (data) {
            form[0].reset();
            form.empty();
            formDiv.hide();
            responsetext.append('<p>' + data + '</p> <p>Would you like to insert another client</p>');
            response.show();
            addAName = true;

        }).fail(function (jqXHR) {
            alert('Error:', jqXHR);

        });
    });

    yes.click(function () {
        if (addAName) {
            form.append(createFormData());
            formDiv.show();
            addAName = false;
        }
        responsetext.empty();
        response.hide();
    });

    no.click(function () {
        responsetext.empty();
        response.hide();
    });

    calculateHours.click(function () {

        form[0].reset();
        form.empty();
        formDiv.hide();
        addAName = true;
        calculate.show();

        $.getJSON('utils/getClient.php', function (data) {
            data.forEach(function (client) {
                var hasButton = false;

                $('<div class="well"><p>' + client.name + '</p><button class="start" class="btn btn-primary">calculate</button></div>').appendTo(calculate)

                    .find('.start').click(function () {

                        var hasInfo = false;
                        var that = $(this).parent();

                        if (!hasInfo) {
                            var individualCal = $('#individualCal');
                            console.log(individualCal);
                            if (individualCal.length > 0) {
                                individualCal[0].empty;
                                individualCal.remove();
                            }

                            that.append('<div id="individualCal"></div>');
                            $.getJSON('utils/getClientHours.php', { id: client.id }, function (data) {
                                $('#individualCal').append('<label>days Missed</label><input id="missedDays" type="number">');
                                $('#missedDays').keyup(function () {
                                    var missedDays = $('#missedDays')[0].valueAsNumber;
                                    console.log(missedDays);
                                    if (missedDays > 0) {

                                        $('<div id="whichDay"><label >which day</label><select id="select">').appendTo('#individualCal');
                                        daysArray.forEach(function (element) {
                                            $('<option>' + element + '</option>').appendTo('#select');
                                        });
                                        $('</select></div>').appendTo('#select');
                                        if (missedDays == 2) {
                                            $('#select').attr('multiple', 1);
                                        }
                                    } else if (missedDays == 0) {
                                        $('#whichDay').remove();
                                    }

                                });

                                $('<button id="addTimeButton" class="btn btn-success">add Time</button>').appendTo($('#individualCal'));
                                $('#addTimeButton').click(function () {
                                    $('<label>extra time</label><input class="extraTime" type="number">').appendTo($('#individualCal'));
                                });

                                $('<button class="finish" class="btn btn-primary">calculate total</button>')
                                    .appendTo($('#individualCal')).click(function () {
                                        var missedHours = 0,
                                            missedMin = 0,
                                            extraMinutes = 0;

                                        if ($('#missedDays').val() > 0) {
                                            var miss = missed($('#select').val(), data);
                                            missedHours = miss.missedHours;
                                            missedMin = miss.missedMin;
                                        }
                                        if ($('.extraTime').length > 0) {
                                            for (var i = 0; i < $('.extraTime').length; i++) {
                                                extraMinutes += $('.extraTime')[i].valueAsNumber;
                                                console.log($('.extraTime')[i].valueAsNumber);
                                            }
                                        }

                                        var total = calculation({ hours: data.regDayHours, minutes: data.regDayMin }, { hours: data.fridayHours, minutes: data.fridayMin }, { hours: missedHours, minutes: missedMin }, extraMinutes, { hours: data.specialHours, minutes: data.specialMin });
                                        console.log(total);
                                        that.append('<p>' + total.totalHours + '</p><p>' + total.totalMinutes + '</p><p>' + total.totalDue + '</p>');
                                    });




                            });
                            hasInfo = true;
                        }


                    });
            });
        });



    });

} ());