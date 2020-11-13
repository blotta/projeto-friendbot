<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback</title>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <main>

<?php

$erro = '';
$nome_aluno = $categoria = $feedback = '';


// Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exitError("Método Inválido");
}

// Input
function get_field($field) {
    if (isset($_POST[$field])) {
        return test_input($_POST[$field]);
    }
    return '';
}

function test_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

$nome_aluno = get_field('nome-aluno');
$categoria = get_field('categoria');
$feedback = get_field('feedback');

if (empty($nome_aluno) || empty($categoria) || empty($feedback)) {
    exitError("Um ou mais campos inválidos.");
}

// DB
$servidor = "localhost";
$usuario = "root";
$senha = "";
$banco = "maki_grupo_3";
$conexao = mysqli_connect($servidor, $usuario, $senha, $banco);
mysqli_set_charset($conexao, 'utf8');
if (!$conexao) {
    exitError("Houve um problema interno"); // mysqli_connect_error());
}

$consulta = "INSERT INTO feedback (nome_aluno, categoria, feedback) ".
            "values ('$nome_aluno', '$categoria', '$feedback')";
$resultado = mysqli_query($conexao, $consulta);
if (!$resultado) {
    exitError("Houve um problema interno"); // mysqli_error($conexao);
}


// Nada deu erro
exitOK();

function exitOK() {
    ?>
            <section class="feedback-result mt-5 mb-5">
                <h1 class="text-center display-4">OBRIGADO!</h1>
                <h5 class="text-center green-text">Feedback enviado com sucesso</h5>
                <div class="text-center">
                    <a role="button" href="index.html" class="mt-2 mb-2 btn btn-secondary">VOLTAR</a>
                </div>
            </section>
        </main>
    </div>
</body>
</html>
<?php
    exit;
}

function exitError($msg) {
    ?>
            <section class="feedback-result mt-5 mb-5">
                <h1 class="text-center display-4">ERRO</h1>
                <h5 class="text-center red-text"><?php echo $msg ?></h5>
                <div class="text-center">
                    <a role="button" href="index.html" class="mt-2 mb-2 btn btn-secondary">VOLTAR</a>
                </div>
            </section>
        </main>
    </div>
</body>
</html>
<?php
    exit;
}

?>


    

