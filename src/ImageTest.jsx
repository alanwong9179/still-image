import React, { useState, useEffect, useRef } from 'react'
import { fabric } from 'fabric';

const VaildWidth = 1000
const VaildHeight = 1000

export default function ImageTest() {

    const [canvas_a, setCanvas_a] = useState('');
    const [canvas_b, setCanvas_b] = useState('');
    const [filterInfo, setFilterInfo]  = useState(null)
    const [originImgSize, setOriginImgSize] = useState(null)
    const [canvasFragment, setCanvasFragment] = useState(null)
    const imgRef = useRef(null)

    const onChangeFilter = () => {
        // fabric.textureSize =  2048
       setFilterInfo(
         new fabric.Image.filters.ColorMatrix({
           matrix: [
             1, -0.1, 0.023, 0, 0,
             0, 1, 0.023, 0.023, 0,
             0, 0, 1, 0, 0,
             0, 0, 0, 1, 0
           ]
         })
       )
       let img = imgRef.current
   
       img.filters.push(
         new fabric.Image.filters.ColorMatrix({
           matrix: [
             1, -0.1, 0.023, 0, 0,
             0, 1, 0.023, 0.023, 0,
             0, 0, 1, 0, 0,
             0, 0, 0, 1, 0
           ]
         })
       )
   
       img.applyFilters()
       canvas_a.renderAll()
     }

    useEffect(() => {
        // init add image 
        if (canvas_a !== '') {
            canvas_a.add(imgRef.current).renderAll()
            canvas_b.add(imgRef.current).renderAll()

            let containerWidth = 500;
            let containerHeight = 400;
      
            let scaleRatio = Math.min(containerWidth / imgRef.current.width, containerHeight / imgRef.current.height);
            canvas_a.setDimensions({ width: canvas_a.getWidth() * scaleRatio, height: canvas_a.getHeight() * scaleRatio });
            canvas_a.setZoom(scaleRatio)
        }
    }, [canvas_a])
    
    useEffect(() => {
        // load image
            fabric.Image.fromURL('https://source.unsplash.com/random/1500x1200', (oImg) => {
                console.log(oImg.width, oImg.height)
                initCanvas(oImg.width, oImg.height)
                setOriginImgSize({width: oImg.width, height: oImg.height})
                imgRef.current = oImg
            }, { crossOrigin: 'Anonymous' })
    }, [])

    const initCanvas = (w, h) => {
        setCanvas_a(new fabric.Canvas('canvasa', {
            height: h,
            width: w,
            backgroundColor: '#123123'
        }))
        setCanvas_b(new fabric.Canvas('canvasb', {
            height: h,
            width: w,
            backgroundColor: '#f1f1f1'
        }))
    }

    const cutImg = (leftValue, topValue, w, h) => {

        return new Promise((reslove, reject) => {
            let outputImageURL = canvas_b.toDataURL({
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

        if (heightMod > 0) {heightStepsCount = heightStepsCount + 1}
        if (widthMod > 0) {widthStepsCount = widthStepsCount + 1}
        
        console.log(widthMod, widthStepsCount, heightMod, heightStepsCount)
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
     console.log(fragmentArr)
    }

    useEffect(() => {
        canvasFragment !== null &&
        reBuildCanvas()
    }, [canvasFragment])

    const reBuildCanvas = () => {
        for (let frg of canvasFragment){
            fabric.Image.fromURL(frg.base64, function (oImg) {
                oImg.set({
                    top: frg.top,
                    left: frg.left,
                })
                oImg.filters.push(filterInfo)
                canvas_b.add(oImg).renderAll()
            })
        }
        onOutput()
    }

    const onOutput = () => {
        let outputImageURL = canvas_b.toDataURL({
            format: 'jpeg',
            quality: 1,
          })  

        console.log(outputImageURL)
    }

    return (
        <div>
                        <button onClick={onLoad}>go</button>
                        <button onClick={onChangeFilter}>color</button>
                        
            <canvas id="canvasa" />

         
            <canvas id="canvasb" />
       
       

        </div>

    )
}

