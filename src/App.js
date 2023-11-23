import React, {useEffect, useState} from 'react'
import {Route, Routes} from 'react-router-dom'
import axios from 'axios'
import Card from './components/Card'
import Header from "./components/Header"
import Index from "./components/Drawer"
import AppContext from "./context";

import Home from "./pages/Home"
import Favorites from "./pages/Favorites"
import Orders from "./pages/Orders";

function App() {
    const [items, setItems] = useState([])
    const [cartItems, setCartItems] = React.useState([])
    const [favorites, setFavorites] = React.useState([])
    const [searchValue, setSearchValue] = React.useState('')
    const [cartOpened, setCartOpened] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)


    React.useEffect(() => {
        async function fetchData() {
            try {
                const [cartResponse, favoritesResponse, itemsResponse] = await Promise.all([
                    axios.get('https://c5543381681bc831.mokky.dev/cart'),
                    axios.get('https://c5543381681bc831.mokky.dev/favorites'),
                    axios.get('https://c5543381681bc831.mokky.dev/items')
                ])

                setIsLoading(false)
                setCartItems(cartResponse.data)
                setFavorites(favoritesResponse.data)
                setItems(itemsResponse.data)
            } catch (error) {
                alert('Ошибка при запросе данных ;(')
                console.log(error)
            }
        }

        fetchData()
    }, [])
    const onAddToCart = async (obj) => {
        try {
            const findItem = cartItems.find((item) => Number(item.parentId) === Number(obj.id))
            if (findItem) {
                setCartItems((prev) => prev.filter((item) => Number(item.parentId) !== Number(obj.id)))
                await axios.delete(`https://c5543381681bc831.mokky.dev/cart/${findItem.id}`);
            } else {
                setCartItems((prev) => [...prev, obj])
                const {data} = await axios.post('https://c5543381681bc831.mokky.dev/cart', obj)
                setCartItems((prev) => prev.map(item => {
                    if (item.parentId === data.parentId) {
                        return {
                            ...item,
                            id: data.id
                        }
                    }
                    return item
                }))
            }
        } catch (error) {
            alert('Не получилось добавить в корзину')
            console.log(error)
        }
    }

    const onRemoveItem = (id) => {
        try {
            axios.delete(`https://c5543381681bc831.mokky.dev/cart/${id}`);
            setCartItems((prev) => prev.filter((item) => Number(item.id) !== Number(id)))
        } catch (error) {
            alert('Ошибка при удалении из корзины')
            console.log(error)
        }
    }
    const onAddToFavorite = async (obj) => {
        try {
            if (favorites.find((favObj) => Number(favObj.id) === Number(obj.id))) {
                axios.delete(`https://c5543381681bc831.mokky.dev/favorites/${obj.id}`)
                setFavorites(prev => prev.filter((item) => Number(item.id) !== Number(obj.id)))

            } else {
                const {data} = await axios.post('https://c5543381681bc831.mokky.dev/favorites', obj)
                setFavorites((prev) => [...prev, data])
            }
        } catch (error) {
            alert('Не удалось добавить в фавориты')
            console.log(error)
        }
    }
    const onChangeSearchInput = (event) => {
        setSearchValue(event.target.value)
    }


    const isItemAdded = (id) => {
        return cartItems.some((obj) => Number(obj.id) === Number(id));
    };

    return (
        <AppContext.Provider
            value={{
                items,
                cartItems,
                favorites,
                isItemAdded,
                onAddToFavorite,
                onAddToCart,
                setCartOpened,
                setCartItems
            }}
        >
            <div className='wrapper clear'>
                <Index
                    items={cartItems}
                    onClose={() => setCartOpened(false)}
                    onRemove={onRemoveItem}
                    opened={cartOpened}
                />

                <Header onClickCart={() => setCartOpened(true)}/>
                <Routes>
                    <Route
                        path="/" element={
                        <Home
                            items={items}
                            cartItems={cartItems}
                            searchValue={searchValue}
                            setSearchValue={setSearchValue}
                            onChangeSearchInput={onChangeSearchInput}
                            onAddToFavorite={onAddToFavorite}
                            onAddToCart={onAddToCart}
                            isLoading={isLoading}
                        />
                    }
                        exact
                    />
                </Routes>

                <Routes>
                    <Route
                        path="/favorites"
                        element={
                            <Favorites/>
                        }
                        exact
                    />
                </Routes>

                <Routes>
                    <Route
                        path="/orders"
                        element={
                            <Orders/>
                        }
                        exact
                    />
                </Routes>
            </div>
        </AppContext.Provider>
    );
}

export default App;