<!-- body content starts here  -->
<nav class="navbar navbar-expand-sm navbar-dark bg-dark ">
  <a class="navbar-brand" href="index.php">replaceDBName</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarText">
    <ul class="navbar-nav ml-auto">
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i class="fa fa-user"></i> <?php echo $token->firstname; ?>
        </a>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
          <a class="dropdown-item" href="login.php?logout=1"><i class="fa fa-sign-out"></i> Logout</a>
        </div>
      </li>
    </ul>
  </div>
</nav>

<main role="main">
  <div class="container-fluid w-100 m-0 p-0">
    <div class="text-center text-primary initloadingtext">
      <h1><i class="fa fa-spinner fa-pulse"></i> Loading...</h1>
    </div>
    <div class="card mainapp collapse border-0">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          ###TABS###
        </ul>
      </div>
      <div class="card-body">
        <div class="tab-content">
          ###TAB_PANELS###
        </div>
      </div>
    </div>
  </div>
</main>