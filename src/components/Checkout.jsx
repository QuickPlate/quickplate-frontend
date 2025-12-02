import { useContext, useActionState } from 'react';

import Modal from './UI/Modal.jsx';
import CartContext from '../store/CartContext.jsx';
import { currencyFormatter } from '../util/formatting.js';
import Input from './UI/Input.jsx';
import Button from './UI/Button.jsx';
import UserProgressContext from '../store/UserProgressContext.jsx';
import useHttp from '../hooks/useHttp.js';
import Error from './Error.jsx';

const requestConfig = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

export default function Checkout() {
  const cartCtx = useContext(CartContext);
  const userProgressCtx = useContext(UserProgressContext);

  const { data, error, sendRequest, clearData } = useHttp(
    `${import.meta.env.VITE_API_URL}/orders`,
    requestConfig
  );

  const cartTotal = cartCtx.items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  function handleClose() {
    userProgressCtx.hideCheckout();
  }

  function handleFinish() {
    userProgressCtx.hideCheckout();
    cartCtx.clearCart();
    clearData();
  }

  function handleBackToCart() {
  userProgressCtx.showCart();
}

  async function checkoutAction(prevState, fd) {
    const customerData = Object.fromEntries(fd.entries()); // { email: test@example.com }

    console.log("ordercustomerData ---- ", customerData);

    await sendRequest(
      {
          customer: {
            name: customerData.name,
            email: customerData.email
          },
          cart: cartCtx.items.map(item => ({
            name: item.name,       
            price: item.price,    
            quantity: item.quantity,
            meal: {            
              id: item.id        
            }
          })),
          street: customerData.street,
          city: customerData.city, 
          zip: customerData.zip,
      }
    );
  }

  const [formState, formAction, isSending] = useActionState(checkoutAction,null);

  let actions = (
    <>
      <Button type='button' textOnly onClick={handleClose}>
        Close
      </Button>
      <Button>Submit Order</Button>
    </>
  );

  if (isSending) {
    actions = <span>Sending order data...</span>;
  }

  if (data && !error) {
    return (
      <Modal
        open={userProgressCtx.progress === 'checkout'}
        onClose={handleFinish}
      >
        <h2>Success!</h2>
        <p>Your order was submitted successfully.</p>
        <p>
          We will get back to you with more details via email within the next
          few minutes.
        </p>
        <p className='modal-actions'>
          <Button onClick={handleFinish}>Okay</Button>
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={userProgressCtx.progress === 'checkout'} onClose={handleClose}>
      <form action={formAction}>
        <h2>Checkout</h2>
        <p>Total Amount: {currencyFormatter.format(cartTotal)}</p>

        <Input label='Full Name' type='text' id='name' className='name' />
        <Input label='E-Mail Address' type='email' id='email' className='email' />
        <Input label='Street' type='text' id='street' className='street' />
        <div className='control-row'>
          <Input label='Zip' type='text' id='zip' className='zip' />
          <Input label='City' type='text' id='city' className='city' />
        </div>

        {error && <Error title='Failed to submit order' message={error} />}

        <p className='modal-actions'>{actions}</p>
      </form>
    </Modal>
  );
}
