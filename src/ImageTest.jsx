import React, { useState, useEffect, useRef } from 'react'
import { fabric } from 'fabric';

//max 100px
const VaildWidth = 100
const VaildHeight = 100

export default function ImageTest() {

    const [canvas_a, setCanvas_a] = useState('');
    const [canvas_b, setcanvas_b] = useState('')
    const [originImgSize, setOriginImgSize] = useState(null)
    const [canvasFragment, setCanvasFragment] = useState(null)

    useEffect(() => {
        loadImg_a()
    }, [])

    useEffect(() => {
        if (canvas_a !== '') {
            fabric.Image.fromURL('https://source.unsplash.com/random/400x400', (oImg) => {
                setOriginImgSize({width: oImg.width, height: oImg.height})
                canvas_a.add(oImg).renderAll()
            }, { crossOrigin: 'Anonymous' })
        }

    }, [canvas_a])

    const loadImg_a = () => {
        setCanvas_a(new fabric.Canvas('canvasa', {
            height: 400,
            width: 400,
            backgroundColor: '#123123'
        }))
        setcanvas_b(new fabric.Canvas('canvasb', {
            height: 400,
            width: 400,
            backgroundColor: '#f1f1f1'
        }))
    }

    const cutImg = (leftValue, topValue, w, h) => {

        return new Promise((reslove, reject) => {
            let outputImageURL = canvas_a.toDataURL({
                format: 'jpeg',
                quality: 1,
                left: w * VaildWidth,
                top: h * VaildHeight,
                width: leftValue,
                height: topValue,

            })
    
            let obj = {}
            obj.base64 = outputImageURL
            obj.left = leftValue
            obj.top = h * VaildHeight
            reslove(obj) 
        })
  
    }

    const onLoad = async () => {
        let widthMod = (originImgSize.width % VaildWidth)
        let widthStepsCount = ((originImgSize.width - widthMod) / VaildWidth)

        let heightMod = (originImgSize.height % VaildHeight)
        let heightStepsCount = ((originImgSize.height - heightMod) / VaildHeight)


        let fragmentArr = []
        let topValue = 0
        for (let h = 0; h < heightStepsCount; h++){
            let leftValue = 0
            for (let w = 0; w < widthStepsCount; w++){ 
                await cutImg(leftValue, topValue, w, h).then(frg => fragmentArr.push(frg))
                leftValue += VaildWidth
            }
            topValue += VaildHeight

        }

     setCanvasFragment(fragmentArr)
    }

    useEffect(() => {
        canvasFragment !== null &&
            load_b()
    }, [canvasFragment])

    const load_b = () => {

        for (let frg of canvasFragment){
            console.log(frg.base64)
            fabric.Image.fromURL(frg.base64, function (oImg) {
                oImg.set({
                    top: frg.top,
                    left: frg.left,
                })
                canvas_b.add(oImg).renderAll()
            })
        }

    }



    return (
        <div>
            <canvas id="canvasa" />
            <canvas id="canvasb" />
            <button onClick={onLoad}>go</button>
        </div>

    )
}
