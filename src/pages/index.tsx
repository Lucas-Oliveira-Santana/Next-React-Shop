import { HomeContainer, Product } from "@/styles/pages/home"
import Image from "next/image"
import {useKeenSlider} from "keen-slider/react"
import Link from "next/link"
import "keen-slider/keen-slider.min.css"
import { stripe } from "@/lib/stripe"
import { GetServerSideProps, GetStaticProps } from "next"
import Stripe from "stripe"


interface HomeProps{
  products : {
    id:string;
    name:string;
    images:string;
    price:string;
  }[]
}


export default function Home({products}:HomeProps) {

  <pre>{JSON.stringify(products)}</pre>


  const [sliderRef] = useKeenSlider({
    slides:{
      perView:3,
      spacing:48
    }
  })
  return (
    <HomeContainer ref={sliderRef} className="keen-slider">
      {products.map(
        product =>{
          return(

        <Link href={`/product/${product.id}`} key={product.id} prefetch={false}>
          <Product className="keen-slider__slide" >
          <Image alt="" src={product.images} width={520} height={480}/>
  
          <footer>
            <strong>{product.name}</strong>
            <span>{product.price}</span>
          </footer>
        </Product>
        </Link>
        ) }
      )}
    </HomeContainer>
  )
}


export const getStaticProps: GetStaticProps = async () => {
  const response = await stripe.products.list({
    expand:['data.default_price']
  })


  const products = response.data.map(product=>{
    const price = product.default_price as Stripe.Price
    return{
      id:product.id,
      name:product.name,
      description:product.description,
      images:product.images[0],
      price: new Intl.NumberFormat("pt-BR",{
        style:"currency",
        currency:"BRL"
      }).format(price.unit_amount! / 100)
    }
    } )
  
    // console.log(response.data)
    return {
      props:{
        products
      },
      revalidate:60 * 60 * 2
    }
  }


