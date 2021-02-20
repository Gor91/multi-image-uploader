$('#mutliForm input,textarea').on('keyup', function () {
    $(this).siblings("div").empty()
});

$("#upload-image").on("click", function () {
    $(".img_").text(" ");
})

const imagesBlock = document.querySelector('#images-block');
const filesInput = document.querySelector('#upload-image');
let image = '';
var is_first = false;
var files = [];

$(document).on('change', 'input[type="file"][multiple]', function () {
    var $this = $(this);
    $this.clone().insertAfter($this);
    $this.hide();
});

filesInput.addEventListener("change", function (event) {
    if (event.target.files.length > 0) {
        if (is_first) {
            image = "";
            imagesBlock.innerHTML = " ";
        }
        is_first = true;

        var target_files = event.target.files;
        if (target_files) {
            for (let f = 0; f < target_files.length; f++) {
                if (target_files[f].type === "image/jpeg" ||
                    target_files[f].type === "image/jpg" ||
                    target_files[f].type === "image/png" ||
                    target_files[f].type === "application/pdf"
                ) {
                    files.push(target_files[f]);
                } else {
                    $('.img_').text('The file must be a file of type: png, jpeg, jpg, pdf.')
                }
            }
        }

        var list = new DataTransfer();
        var tat = new FileReader();
        var file_data = [];
        var myFileList;
        for (let i = 0; i < files.length; i++) {
            console.log(files[i])
            var file_up = new File([files[i]], files[i].name, {type: files[i].type})
            file_data.push(file_up);
            list.items.add(file_up);
            myFileList = list.files;
            let file = files[i];
            //Only pics
            if (!file.type.match('image'))
                continue;
            let picReader = new FileReader();
            picReader.addEventListener("load", function (event) {
                let picFile = event.target;
                image = `${image}<figure class="file_icons_ mr-3 mb-2 position-relative d-flex align-items-center justify-content-center">
                        <button type="button" class="btn shadow-none bg-transparent image-container" data-toggle="modal" data-target="#imageModal" onclick="getImageSrc('${picFile.result}')">
                                            <img src="${picFile.result}" alt="">
                        </button>
                    <button type="button" onclick="removeImages(this)"
                     data-name="${files[i].name}" class="image-remove position-absolute btn rounded-circle shadow-none p-0 d-flex align-items-center justify-content-center">
                        <i class="pe-7s-close"></i> </button>
                </figure>`;
                imagesBlock.innerHTML = image
            });
            //Read the image
            picReader.readAsDataURL(file);

        }
        $("#upload-image")[0].files = myFileList;
    }
});

function getImageSrc(srcValue) {
    document.querySelector('#imageModal .modal-body img').setAttribute('src', srcValue)
}

function removeImages(e, name) {
    let list = new DataTransfer();
    var new_files = [];
    let myFileList = [];

    for (let i in files) {
        if (files[i].name === $(e).attr("data-name")) {
            delete files[i];
            continue;
        }
        let file = new File([files[i]], files[i].name, {type: files[i].type})
        list.items.add(file);
        myFileList = list.files;
        new_files.push(files[i])
    }

    files = new_files;

    if (files.length == 0) {
        let file = new File(["content"], "");
        list.items.add(file);
        $("#upload-image")[0].files = list.files;
    } else {
        $("#upload-image")[0].files = myFileList;
    }

    e.parentElement.remove();
}

$(".sell_with_us_send").on("click", function () {
    var fd = new FormData();
    $.each(files, function (k, v) {
        fd.append('file[]', v);
    })

    $('#mutliForm *').filter(':input').each(function (a, b) {
        fd.append($(b).attr('name'), $(b).val())
    });

    $.ajax({
        type: "POST",
        url: asd,
        processData: false,
        contentType: false,
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: fd,
        success: function (data) {
            if (data && data.response) {
                $("#alertMessages").html("<div class=\"alert alert-success\">\n" +
                    "<div class=\"d-flex align-items-center\">\n" +
                    "<i class=\"pe-7s-check mr-2\"></i> Thank you for contacting us." +
                    "</div>\n" +
                    "</div>");
            }
            setTimeout(function () {
                $(".sell_with_us_send").prop('disabled', true);
                $('#mutliForm')[0].reset();
                location.reload()
            }, 2000)
        },
        error: function (error) {
            if (error.responseJSON) {
                let errors = error.responseJSON.errors.error;
                if (errors) {
                    console.log(errors)
                    for (let _key in errors) {
                        if (errors[_key] && errors[_key].length > 0) {
                            if (_key == "file.0") {
                                $(".img_").text(errors[_key][0].replace("file.0", "image"))
                            }
                            $('.' + _key).text(errors[_key][0])
                        }
                    }
                }
            }
        }
    });
})