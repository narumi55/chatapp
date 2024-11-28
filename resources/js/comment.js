$(function() {
    // コメント投稿
    $('form').on('submit', function(event) {
        event.preventDefault();  // フォームの通常送信をキャンセル

        var comment = $('#comment').val();  // コメントの取得

        $.ajax({
            url: "{{ route('add') }}",  // サーバー側のコメント追加ルート
            method: "POST",
            data: {
                _token: $("input[name='_token']").val(),
                comment: comment
            },
            success: function(response) {
                if(response.success) {
                    $('#comment').val('');  // コメント欄をクリア
                    get_data();  // コメントを再取得して表示
                } else {
                    alert('Error: Could not add comment');
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", status, error);
                alert("Error: Could not add comment");
            }
        });
    });
});

// get_data関数を使ってコメントを更新
function get_data() {
    $.ajax({
        url: "result/ajax/",
        dataType: "json",
        success: function(data) {
            var html = '';
            for (var i = 0; i < data.comments.length; i++) {
                html += `
                    <div class="media comment-visible">
                        <div class="media-body comment-body">
                            <div class="row">
                                <span class="comment-body-user">${data.comments[i].name}</span>
                                <span class="comment-body-time">${data.comments[i].created_at}</span>
                            </div>
                            <span class="comment-body-content">${data.comments[i].comment}</span>
                        </div>
                    </div>
                `;
            }
            $("#comment-data").html(html);
        },
        error: function(xhr, status, error) {
            console.error("AJAX Error:", status, error);
            alert("コメントの取得に失敗しました。");
        }
    });

    setTimeout(get_data, 5000);
}
