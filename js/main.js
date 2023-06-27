// definimos nuestros parametros para arrancar la construccion de nuestros productos
class Producto{
    constructor(name, id, type, price){
        this.name = name;
        this.id = id;
        this.type = type;
        this.price = price;
    }
}

// Creamos un array de nustros productos bases disponibles (4 ejemplos a usar)
const productosBase = [
    {name:"Remera Azul", id:"001", type:"Remeras", price:7500},
    {name:"Remera Negra", id:"002", type:"Remeras", price:8000},
    {name:"Pantalon Azul", id:"003", type:"Pantalones", price:10000},
    {name:"Buzo Negro", id:"004", type:"Buzos", price:12000}
]

// -------------------------------------------------------------------------------- //
// OR lógico para cargar local storage, y tambien nos ahorra codigo
const productos = JSON.parse(localStorage.getItem("productos")) || []  // si no encontraste, lo pongo en el array vacio
let carrito = JSON.parse(localStorage.getItem("carrito")) || []
const pedidos = JSON.parse(localStorage.getItem("pedidos")) || []
// -------------------------------------------------------------------------------- //



const agregarProducto = ({name, id, type, price})=>{ // forma de ahorrar codigo en vez de poner parametro.name, etc
    //Def que revisa si existe un producto con el mismo id
    if(productos.some(prod=>prod.id===id)){
        // console.warn("") // no necesario
    } else { // si no existe...
        const productoNuevo = new Producto(name, id, type, price) // agregamos nuestro producto
        productos.push(productoNuevo)
        // guarda el nuevo array de productos en el local storage
        localStorage.setItem('productos', JSON.stringify(productos))
    }
}

// si el array es vacio
const productosPreexistentes = ()=>{
    // utilizamos el array de productos pre-existente
    if (productos.length===0){
        productosBase.forEach(prod=>{
            let dato = JSON.parse(JSON.stringify(prod))
            agregarProducto(dato)}
            )
    }
}

// esto nos permite calcular el total de los productos adquiridos por el cliente
const totalCarrito = ()=>{
    let total = carrito.reduce((acumulador, {price, quantity})=>{
        return acumulador + (price*quantity)
    }, 0)
    return total
}
// mostramos el monton en el html
const totalCarritoRender = ()=>{
    // se encarga de calcular el total del carrito
    const carritoTotal = document.getElementById("carritoTotal")
    carritoTotal.innerHTML=`Precio total: $ ${totalCarrito()}` // calculamos
}

// def que nos permite agregar prod al carrito
const agregarCarrito = (objetoCarrito)=>{
    // agrega productos al carrito
    carrito.push(objetoCarrito)
    totalCarritoRender() // informamos
}



const renderizarCarrito = ()=>{
    // borra el contenido del carrito y renderiza el carrito en una lista
    const listaCarrito = document.getElementById("listaCarrito")
    // borramos para evitar datos antiguos y que no molesten
    listaCarrito.innerHTML=""

    carrito.forEach(({name, price, quantity, id}) =>{
        let elementoLista = document.createElement("table")
        elementoLista.innerHTML=`Producto: ${name} / $: ${price} / Cant.: ${quantity} <button style="padding: 1px; background-color: rgb(0, 0, 88); border-radius: 5px; border-color: black; color: white" id="eliminarCarrito${id}"> x </button>`
        listaCarrito.appendChild(elementoLista)

        const botonBorrar = document.getElementById(`eliminarCarrito${id}`)
        botonBorrar.addEventListener("click",()=>{
            // creo un array sin el elemento a borrar y lo igualo a carrito
            carrito = carrito.filter((elemento)=>{
                if(elemento.id !== id){
                    return elemento
                }
            })
            let carritoString = JSON.stringify(carrito)
            localStorage.setItem("carrito", carritoString)
            renderizarCarrito()
        })
        let carritoString = JSON.stringify(carrito)
        localStorage.setItem("carrito", carritoString)
    })
}



const borrarCarrito = ()=>{
    carrito.length = 0  //es una manera de borrar el contenido de un array constante
    let carritoString = JSON.stringify(carrito)
    localStorage.setItem("carrito", carritoString)
    renderizarCarrito()
}


const renderizarProductos = (arrayUtilizado)=>{
    // renderiza productos en el DOM
    const contenedorProductos = document.getElementById("contenedorProductos")
    // borramos para no duplicar
    contenedorProductos.innerHTML = ""

    // creamos la plantilla para nuestro producto
    arrayUtilizado.forEach(({name, id, type, price})=>{
        const prodCard = document.createElement("div")
        prodCard.classList.add("col-xs")
        prodCard.classList.add("card")
        prodCard.style = "width: 270px;height: 550px; margin:3px"
        prodCard.id = id
        prodCard.innerHTML = `
                <img src="./assets/container/${name+id}.webp" class="card-img-top" alt="${name}">
                <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <h6>${type}</h6>
                    <spa/span>
                    <span>$ ${price}</span>
                    <form id="form${id}">
                        <label for="contador${id}">Cantidad</label>
                        <input type="number" placeholder="0" id="contador${id}">
                        <button class="btn btn-primary" style="margin: 10px ; padding: 2px; background-color: rgb(0, 0, 88); border-radius: 4px; border-color: black; color: white" id="botonProd${id}">Agregar</button>
                    </form>
                </div>`

        contenedorProductos.appendChild(prodCard) //agregamos al contenedor
        const btn = document.getElementById(`botonProd${id}`)

        // Funcionalidad al boton de agregar para agregar prods al carrito
        btn.addEventListener("click",(e)=>{
            e.preventDefault() // no se borra cuando actualizo
            const contadorQuantity = Number(document.getElementById(`contador${id}`).value)
            if(contadorQuantity>0){
                agregarCarrito({name, id, type, price, quantity:contadorQuantity})
                renderizarCarrito()
                const form = document.getElementById(`form${id}`)
                form.reset() // vuelve al valor 0
            }
        }) 
    })
}



// conseguir todos los datos de un formulario
const finalizarCompra = (event)=>{
    // como conseguir todos los datos de un form
    // conseguimos la data de la form
    const data = new FormData(event.target)
    // creamos un objeto que sea {nombreInput: valorInput,...}
    const cliente = Object.fromEntries(data)
    // Creamos un "ticket"
    const ticket = {cliente: cliente, total:totalCarrito(),id:pedidos.length, productos:carrito} 
    // Guardamos el ticket en nuestra "base de datos"
    localStorage.setItem("pedidos", JSON.stringify(pedidos))
    // Borra el array y le da un mensaje al usuario
    borrarCarrito()

    let mensaje = document.getElementById("carritoTotal")
    mensaje.innerHTML = "Compra realizada!"

}


// DOM para ejecutar la compra
const compraFinal = document.getElementById("formCompraFinal") //buscar formulario
compraFinal.addEventListener("submit",(event)=>{  // le ponemos evento
    // evitamos el reset
    event.preventDefault()
    if(carrito.length>0){
        finalizarCompra(event) // ejecuta la compra
    } else {
        alert("Canasta vacia") 
    }
})


// funciona como filtro donde lo usamos solo con el tipo de ropa!
const selectorTipo = document.getElementById("tipoProducto")
selectorTipo.onchange = (evt)=>{
    const tipoSeleccionado =  evt.target.value
    if(tipoSeleccionado === "0"){
        renderizarProductos(productos)
    } else {
        renderizarProductos(productos.filter(prod=>prod.type === tipoSeleccionado))
    }
}

// juntamos todas las funciones de la pagina
const app = ()=>{
    productosPreexistentes()
    renderizarProductos(productos)
    renderizarCarrito()
    totalCarritoRender()
}

// ejecuto mi aplicacion, y lo junte en esto
app()