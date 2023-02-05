import { stripe } from "@/lib/stripe"
import { ImageContainer, ProductContainer, ProductDetails } from "@/styles/pages/product"
import axios from "axios"
import { GetServerSideProps, GetStaticProps } from "next"
import Image from "next/image"
import { useRouter } from "next/router"
import { useState } from "react"
import Stripe from "stripe"

interface ProductProps{
  product:{
    id:string;
    name:string;
    image:string;
    price:string;
    description:string;
    defaultPriceId:string;
  }
}



export default function Product({product} : ProductProps) {
  const [isCreatingCheckoutSession , setIsCreatingCheckoutSession] = useState(false)

  async function handleBuyProduct(){
    try{

      setIsCreatingCheckoutSession(true)

      const response = await axios.post("/api/checkout",{
        priceId:product.defaultPriceId
      })

      const  {checkoutUrl} = response.data

      window.location.href = checkoutUrl
    }catch(err){

      setIsCreatingCheckoutSession(false)


      alert("Falha ao redirecionar ao checkout!")
    }
  }

  return (
    <ProductContainer>
      <ImageContainer>
        <Image src={product.image} width={520} height={480} alt=""/>
      </ImageContainer>
      <ProductDetails>
        <h1>{product.name}</h1>
        <span>{product.price}</span>
        <p>{product.description}</p>

        <button disabled={isCreatingCheckoutSession} onClick={handleBuyProduct}>Comprar agora</button>
      </ProductDetails>
    </ProductContainer>
  )
}

export const getServerSideProps : GetServerSideProps<any,{ id:string}> = async({params}) => {

  const productId = params!.id


  const product = await stripe.products.retrieve(productId,{
    expand:["default_price"]
  })

  const price = product.default_price as Stripe.Price


  return{
    props:{
      product:{
          id:product.id,
          name:product.name,
          description:product.description,
          image:product.images[0],
          defaultPriceId: price.id,
          price: new Intl.NumberFormat("pt-BR",{
            style:"currency",
            currency:"BRL"
          }).format(price.unit_amount! / 100),
      }
    },
    // revalidate:60 * 60 * 1 // 1 hour
  }
}