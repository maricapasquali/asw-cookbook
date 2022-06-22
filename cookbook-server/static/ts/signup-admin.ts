$(() => {
    console.log("ready!")

    // COMPONENTS
    const form = $("form")
    const resetFormBtn = $("#reset-btn")
    const submitBtn = $("button#submit-btn")
    const spinner = submitBtn.find("span")
    const inputFile = $(".file")
    const preview = $(".upload-preview img")
    const alerts = $(".alert")
    const resetPreviewImageBtn = $("#reset-preview")
    const loadPreviewImageBtn = $("#load-preview")

    const reader = new FileReader()
    reader.onload = function (e) {
        const imageBase64 = e.target.result
        preview.attr("src", imageBase64.toString())
        preview.show()
        preview.prev().hide()
        resetPreviewImageBtn.show()
    }

    // FUNCTIONS
    function initialization() {
        spinner.hide()
        resetPreviewImageBtn.hide()
        alerts.hide()
        preview.hide()

        inputFile.on("change", loadNewImage)
        loadPreviewImageBtn.on("click", triggerLoadNewImage)
        resetPreviewImageBtn.on("click", resetPreviewImage)
        resetFormBtn.on("click", resetForm)
        form.on("submit", submitForm)
    }

    function startRequest() {
        submitBtn.attr("disabled", "true")
        spinner.show()
        alerts.hide()
    }

    function successRequest(data: any) {
        console.debug("User id = ", data?.userID)
        $(".alert-success").show()
    }

    function errorRequest(jqXHR: JQuery.jqXHR) {

        switch (jqXHR?.status) {
            case 400: {
                const warning = $(".alert-warning")
                warning.find("span").html(jqXHR?.responseJSON?.description)
                warning.show()
            }
                break
            default: {
                const _error = jqXHR?.responseJSON?.description || jqXHR?.statusText || "Unknown error"
                const danger = $(".alert-danger")
                danger.find("span").html(_error)
                danger.show()
            }
                break
        }
    }

    function endRequest() {
        spinner.hide()
        submitBtn.removeAttr("disabled")
    }

    function submitForm(event: any) {
        event.preventDefault()

        const target = event.target

        if (target.checkValidity()) {
            const formData = new FormData(target)
            if ((formData.get("img") as File).size === 0) formData.delete("img")
            if (!formData.get("tel_number")) formData.delete("tel_number")
            if (!formData.get("birth_date")) formData.delete("birth_date")

            // for(const [k, v] of formData.entries()) console.debug(k, ' -> ', v);

            const postOptions: JQuery.UrlAjaxSettings = {
                url: "/api/admins",
                data: formData,
                processData: false,
                contentType: false,
                dataType: "json",
                beforeSend: startRequest
            }

            $.post(postOptions)
                .done(successRequest)
                .fail(errorRequest)
                .always(endRequest)
        } else {
            event.stopPropagation()
        }
        target.classList.add("was-validated")
    }

    function resetForm(event: any) {
        event.preventDefault()
        form.trigger("reset")
        resetPreviewImageBtn.trigger("click")
        alerts.hide()

        form.get(0).classList.remove("was-validated")
    }

    function resetPreviewImage(event: any) {
        event.preventDefault()
        inputFile.val("")
        preview.attr("src", "")
        preview.hide()
        preview.prev().show()
        resetPreviewImageBtn.hide()
    }

    function loadNewImage(event: any) {
        const file = $(event.currentTarget).get(0).files[0]
        if (/image\/.*/.test(file.type)) reader.readAsDataURL(file)
        else resetPreviewImage(event)
    }

    function triggerLoadNewImage(event: any) {
        event.preventDefault()
        inputFile.trigger("click")
    }

    // MAIN
    initialization()
})
