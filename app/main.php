<?php
// скрываем все ошибки, если они есть
error_reporting(0);

session_start();

// получаем значение адресной строки
$page = $_GET['page'];
// массив всех данных для формирования страниц
$data = array();
require_once 'config.php';

switch($page){
	case 'index':
		$data['title'] = "Добро пожаловать";
		require_once 'templates/main.php';
		break;

	case 'projects':
		$data['title'] = "Портфолио";
		$dbcon = connectToDB();
		$projects = getDataAsArray($dbcon, $data_sql['getPortfolio']);
		require_once 'templates/main.php';
		break;

	case 'about':
		$data['title'] = "Обо мне";
		require_once 'templates/main.php';
		break;

	case 'contacts':
		$data['title'] = "Связаться со мной";
		require_once 'templates/main.php';
		break;

	case 'logout':
		unset($_SESSION['auth']);
		session_destroy();
		header("HTTP/.1 307 Temporary Redirect");
		header("Location: /");
		break;

}
?>