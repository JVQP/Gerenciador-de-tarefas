
const express = require('express');
const { engine } = require('express-handlebars')
const mysql = require('mysql2');
const sqlite = require('sqlite3')

const PORT = process.env.BASE_URL || 8080;

///////// CONEXÃO COM O BANCO DE DADOS MYSQL /////////////

/*const db = mysql.createConnection({
    host: 'localhost',
    user: 'Admin',
    password: 'jv020904',
    database: 'gerenciamento_tarefas'
})


/*db.connect((err) => {

    if(err) throw err

    console.log("Conexão com banco concedida!")

})*/



//// CONFIGURAÇÕES /////

const db = new sqlite.Database("Database.sqlite", (err) => {
    if (!err) console.log("Conexão ao banco com sucesso!")
    else console.log("Erro ao conectar ao banco")
});

// ------ CRIANDO BANCO DE DADOS SQLITE ------ {


function criar() {
    const query = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome VARCHAR(50),
                email VARCHAR(100),
                usuario VARCHAR(50),
                senha VARCHAR(50),
                confirmar_senha VARCHAR(50)
               
            );
        `;
    db.run(query, (err) => {
        if (!err) console.log("Tabela usuário criada com sucesso!");
        else console.log("Erro ao criar a tabela")
    })
}


function criar2() {

    var query = `CREATE TABLE tarefas(

    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao VARCHAR(100),
    data DATA,
    situacao VARCHAR(50),
    tarefa_usuario VARCHAR(50),
    conclusao VARCHAR(50)

)`

    db.run(query, (err) => {
        if (!err) console.log("Tabela tarefas criada com sucesso!");
        else console.log("Erro ao criar a tabela tarefas!", err.message)
    })


}


function drop() {
    db.run("DROP TABLE tarefas", (err) => {
        if (!err) console.log("Tabela usuarios exluida!");
        else console.log("Ero ao excluir tabela!")
    })
}


function DELETE() {
    db.run("DELETE FROM usuarios WHERE id = 16", (err) => {
        if (!err) console.log("Dados da tabela removidos!");
        else console.log("Erro ao executar o comando SQL", err.message);
    })
}

//----------------------------------------------}



const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'))
app.use("/css", express.static("./css"))
app.use('/imagens', express.static("./imagens"))
app.use(express.urlencoded({ extended: false }))
app.use(express.json());


////////// CRIAÇÃO DE ROTAS //////

app.get("/", function (req, res) {
    res.render('login')
})


/// ROTA DA PÁGINA PRINCIPAL ////

app.get('/views/pagina_principal', function (req, res) {

    db.all("SELECT * FROM tarefas", [], (err, rows) => {
        if (!err) res.render('principal', { tarefas: rows })
        else console.log("Erro ao consultar o banco de dados!")
    })
})

app.get('/views/pagina_usuario', function (req, res) {


    db.all("SELECT * FROM usuarios", [], (err, rows) => {
        if (!err) res.render('usuario', { usuarios: rows })
    })
})

app.get('/views/pagina_tarefas', function (req, res) {
    db.all("SELECT * FROM usuarios", [], (err, rows) => {
        if (!err) res.render('tarefas', { usuarios: rows })
        else console.log("Erro ao consultar o banco de dados")
    })
})


// -------------------------- ROTA PARA TAREFA EM ANDAMENRTO -------------- {

app.get('/views/tarefa_andamento', function (req, res) {

    db.all("SELECT id, descricao, data, situacao, tarefa_usuario, conclusao FROM tarefas WHERE conclusao = 'Analisando' ", (err, rows) => {
        if (!err) {
            console.log("Resultado: ", rows)
            return res.render('tarefa_emandamento', { tarefas: rows })
        } else {
            console.log("Erro ao consultar a informação, ", err);
        }
    })



})

//--------------------------------------------------------------------------- }

// --------------------ROTA DE TAREFA CONCLUIDA--------------------------- {

app.get('/views/tarefas_concluidas', function (req, res) {

    db.all("SELECT id, descricao, data, situacao, tarefa_usuario, conclusao FROM tarefas WHERE conclusao = 'Concluido' ", (err, rows) => {
        if (!err) {
            console.log("Resultado: ", rows)
            return res.render('tarefa_concluida', { tarefas: rows })
        } else {
            console.log("Erro ao consultar a informação, ", err);
        }
    })


})

//------------------------------------------------------------------------- }



/*ROTA DE AUTENTICAÇÃO*/
//------------------------------------ {


app.post("/principal", function (req, res) {
    const inputUsuario = req.body.input_usuario;
    const inputSenha = req.body.input_senha;

    if (!inputUsuario || !inputSenha) {
        console.log("Usuário ou senha não informados");
        return res.render('login', { mensagem: 'Usuário ou senha não informados!**' });
    }

    const query = `SELECT * FROM usuarios WHERE usuario = ? AND senha = ?`;

    db.get(query, [inputUsuario, inputSenha], (err, row) => {
        if (err) {
            console.error("Erro ao consultar o banco de dados:", err.message);
            return res.status(500).send("Erro no servidor");
        }

        if (row) {
            console.log("Bem-vindo!", row.nome);
            return res.redirect('/views/pagina_principal')
        } else {
            console.log("Usuário ou senha inválidos");
            return res.render('login', { mensagem: 'Usuário ou senha inválidos, tente novamente!' });
        }
    });
});



//------------------------------------------------------------}



/*ROTA PARA CADASTRO DE USUÁRIO*/

// ------------------------------------------------------ {

app.post('/usuario', function (req, res) {


    var nome = req.body.nome;
    var usuario = req.body.usuario;
    var email = req.body.email;
    var senha = req.body.senha;
    var confirmar_senha = req.body.confirmar_senha;




    if (nome == "" || usuario == "" || email == "") {
        console.log("Preencha todos os campos para finalizar o cadastro!")
        res.render('usuario', { mensagemErro: 'Preencha todos os campos para finalizar o cadastro!' })
    } 

     if(confirmar_senha !== senha){

        console.log("Senhas não compativeis, informe novamente!")
        res.render('usuario', {mensagemErro: 'Senhas não compativeis, informe novamente!'})

    }  else {
        const query = `INSERT INTO usuarios 
        (nome, email, usuario, senha, confirmar_senha)
        VALUES (?, ?, ?, ?, ?)`;

        db.run(query, [nome, email, usuario, senha, confirmar_senha], (err, rows) => {
            if (!err) {
                console.log("Usuário cadastrado com sucesso!");
                res.render('usuario', { mensagemSucesso: 'Usuário cadastrado com sucesso!'})
            }

            else {
                console.log("Erro de cadastro. Tente novamente!" + err);
                res.render('usuario', { mensagemErro: 'Erro ao cadastrar o usuário, tente novamente!' })
            }
        })

    }

    

})


/* ROTA PARA REGISTRAR TAREFAS */

//----------------------------------------------------- {

app.post('/tarefa', function (req, res) {


    var descricao = req.body.descricao;
    var data = req.body.data;
    var situacao = req.body.situacao;
    var usuario = req.body.usuario;
    var conclusao = req.body.concluido_andamento;

    if (descricao == "" || data == "" || situacao == "" || usuario == "" || conclusao == "") {
        console.log("Por favor, preencha todos os campos para finalizar o registro de tarefa!");
        res.render('tarefas', { mensagemErro: 'Por favor, preencha todos os campos para finalizar o registro de tarefa!' })
    } else {

        var query = `INSERT INTO tarefas(descricao, data, situacao, tarefa_usuario, conclusao) VALUES (?,?,?,?,?)`;

        db.run(query, [descricao, data, situacao, usuario, conclusao], (err) => {
            if (!err) {
                console.log('Tarefa registrada com sucesso!');
                res.render('tarefas', { mensagemSucesso: 'Tarefa registrada com sucesso!' })
            }
            else {
                console.log("Erro ao registrar tarefa. Tente novamente!", err);
                res.render('tarefas', { mensagemErro: 'Erro ao adicionar tarefa, tente novamente ou consulte ao administrador!' })
            }
        })

    }

})


//--------------------------REMOVENDO TAREFAS------------------------------}
app.get('/remover/:id', function (req, res) {

    var query = "DELETE FROM tarefas WHERE id = ?";

    db.run(query, [req.params.id], (err) => {
        if (!err) {
            console.log("Tarefa removida com sucesso!")
            res.redirect('/views/pagina_principal')
        }
        else {
            console.log("Erro ao remover a tarefa!", err)
            res.render('/ERRORderemover');
        }
    })

})


//--------------------------------------------------------}



/*ROTA PARA EDITAR TAREFAS*/

//----------------------------------------------{

app.get('/editar_tarefa/:id', function (req, res) {

    db.all("SELECT * FROM tarefas WHERE id = ?", [req.params.id], (err, rows) => {
        if (!err) {
            res.render('editar', { tarefas: rows, mensagemSucesso: 'Tarefa editada com sucesso!' })
        }
        else {
            console.log("Erro ao consultar ao banco!")
            res.render('editar', { mensagemErro: 'Erro ao editar tarefa, tente novamente ou consulte ao administrador!' })
        }
    })

})

app.post('/editar', function (req, res) {

    var id = req.body.id;
    var descricao = req.body.editar_descricao;
    var data = req.body.editar_data;
    var situacao = req.body.editar_situacao;
    var usuario = req.body.editar_usuario;
    var confirmar = req.body.editar_concluido_andamento;

    var query = `UPDATE tarefas SET descricao = '${descricao}', data = '${data}', situacao = '${situacao}', tarefa_usuario = '${usuario}', conclusao = '${confirmar}' WHERE id = ${id}`;

        if(id == "" || descricao == "" || situacao == "" || usuario == "" || confirmar == ""){
            console.log("Por favor, preencha todos os campos para finalizarmos a sua edição!");
            res.render('editar', {mensagemErro: 'Por favor, preencha todos os campos para finalizarmos a sua edição!'})
        } else {
            db.run(query, (err) => {
                if (!err) {
                    console.log("Tarefa editada com sucesso!")
                    res.redirect('/views/pagina_principal')
                } else {
                    console.log("Erro ao editar tarefa, tente novamente!" + err);
                    res.render('editar', {mensagemErro: 'Erro ao registrar a tarefa, consulte ao administrador!'})
                }
            })
        
        }
                
})

//-----------------------------------------------}







// ------------ ROTA PARA CONCLUIR TAREFA -------- {


app.get('/concluir/:id', function (req, res) {

    var query = `UPDATE tarefas SET conclusao = 'Concluido' WHERE id = '${req.params.id}'`;

    db.run(query, (err) => {
        if (!err) {
            console.log("Tarefa concluida com sucesso!");
            return res.redirect('/views/tarefas_concluidas');
        } else {
            console.log("Erro ao concluir tarefa!", err.message);
            return res.redirect('/views/pagina_principal');
        }
    })

})




// ------------------------------------------------------------- }


// -------------------------- ROTA DE PESQUISA ------------------- {

app.post('/pesquisa', function (req, res) {
    var pesquisa = req.body.pesquisa;

    if (pesquisa === "") {
        console.log('Não conseguimos localizar a sua pesquisa, tente novamente!');
        return res.send('Informe a tarefa que deseja encontrar!');
    }

    var query = `SELECT * FROM tarefas WHERE descricao LIKE ?`;

    db.all(query, [`%${pesquisa}%`], (err, rows) => {
        if (err) {
            console.log('Erro ao consultar o banco', err.message);
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        }

        if (rows.length > 0) {
            console.log('Resultado: ', rows);
            res.render('pesquisa', { tarefas: rows });
        } else {
            console.log('Nenhuma tarefa encontrada!');
            res.send('Nenhuma tarefa encontrada!');
        }
    });
});

app.get('/pesquisa', function (req, res) {
    db.all('SELECT * FROM tarefas', (err, rows) => {
        if (err) {
            console.log('Erro ao consultar o banco', err.message);
            return res.status(500).json({ error: 'Erro ao consultar o banco de dados' });
        }
        res.render('pesquisa', { tarefas: rows});
    });
});


//- ----------------------------------------------------------------}



////// ROTA DO SERVIDOR ////

app.listen(PORT, () => {
    console.log("Servidor rodando: http://localhost:8080/");
})