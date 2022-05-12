$(function() {
    console.log( "ready!" );

    // COMPONENTS
    const form = $("form")
    const resetFormBtn = $("#reset-btn");
    const submitBtn = $("button#submit-btn");
    const spinner = submitBtn.find("span")
    const inputFile = $(".file")
    const preview = $(".upload-preview img");
    const alerts = $(".alert")
    const resetPreviewImageBtn = $("#reset-preview")
    const loadPreviewImageBtn = $("#load-preview")

    const reader = new FileReader();
    reader.onload = function(e){
        const image_base64 = e.target.result;
        preview.attr("src", image_base64);
        preview.show()
        preview.prev().hide()
        resetPreviewImageBtn.show()
    };

    // FUNCTIONS
    function initialization(){
        spinner.hide()
        resetPreviewImageBtn.hide()
        alerts.hide()
        preview.hide()


        inputFile.on('change', loadNewImage)
        loadPreviewImageBtn.on('click',  triggerLoadNewImage)
        resetPreviewImageBtn.on('click', resetPreviewImage)
        resetFormBtn.on('click', resetForm)
        form.on('submit', submitForm)
    }

    function startRequest(){
        submitBtn.attr("disabled", true)
        spinner.show()
        alerts.hide()
    }

    function endRequest(){
        spinner.hide()
        submitBtn.attr("disabled", false)
    }

    function submitForm(event){
        event.preventDefault()

        let target = event.target

        if (target.checkValidity()) {

            let formData = new FormData(target)
            if(formData.get('img').size === 0) formData.delete("img")
            if(!formData.get('tel_number')) formData.delete("tel_number")
            if(!formData.get('birth_date')) formData.delete("birth_date")

            //for(const [k, v] of formData.entries()) console.debug(k, ' -> ', v);

            $.post({
                url: "/api/admins",
                data: formData,
                processData: false,
                contentType: false,
                dataType: "json",
                beforeSend: startRequest
            }).done(function(data) {
                console.debug("User id = ", data?.userID)
                $(".alert-success").show()
            }).fail(function(jqXHR) {
                switch (jqXHR?.status){
                    case 400:
                        let warning = $(".alert-warning")
                        warning.find("span").html(jqXHR?.responseJSON?.description)
                        warning.show()
                        break
                    default:
                        let _error = jqXHR?.responseJSON?.description || jqXHR?.statusText || 'Unknown error'
                        let danger = $(".alert-danger")
                        danger.find("span").html(_error)
                        danger.show()
                        break
                }
            }).always(function (){
                endRequest()
            });

        }
        else {
            event.stopPropagation()
        }
        target.classList.add('was-validated')
    }

    function resetForm(event) {
        event.preventDefault()
        form.trigger("reset");
        resetPreviewImageBtn.trigger("click")
        alerts.hide()

        form.get(0).classList.remove('was-validated')
    }

    function resetPreviewImage(event){
        event.preventDefault()
        inputFile.val("")
        preview.attr("src", "");
        preview.hide()
        preview.prev().show()
        resetPreviewImageBtn.hide()
    }

    function loadNewImage(event){
        const file = $(event.currentTarget)[0].files[0];
        if(/image\/.*/.test(file.type)) reader.readAsDataURL(file);
        else resetPreviewImage(event)
    }

    function triggerLoadNewImage(event){
        event.preventDefault()
        inputFile.trigger('click')
    }

    // MAIN
    initialization()
});
