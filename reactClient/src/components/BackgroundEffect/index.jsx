import { useEffect, useState } from "react";

import Forest from '../../assets/forest.jpg';
import ForestThumb from '../../assets/forest-thumb.jpg';

import Beach from '../../assets/beach.jpg';
import BeachThumb from '../../assets/beach-thumb.jpg';

import Mountain from '../../assets/mountain.jpg';
import MountainThumb from '../../assets/mountain-thumb.jpg';

import Library from '../../assets/library.jpg';
import LibraryThumb from '../../assets/library-thumb.jpg';

import NoImage from '../../assets/noImage.svg';

import './index.scss';

const BackgroundEffect = ({ callObject, showCameraSettings, processiongObject, setProcessingObject }) => {




    useEffect(() => {
        if (callObject) {
            callObject.updateInputSettings(processiongObject);
        }
    }, [processiongObject])

    const blurCamera = (event) => {



        if (event.currentTarget.value == 0) {
            setProcessingObject({
                ...processiongObject, video: {
                    processor: {
                        type: 'none',
                    },
                }
            })
        } else {
            setProcessingObject({
                ...processiongObject, video: {
                    processor: {
                        type: 'background-blur',
                        config: { strength: parseFloat(event.currentTarget.value) },
                    },
                }
            })
        }


    };
    const cameraBackground = (event) => {

        console.log(event.currentTarget.src);

        if (event.currentTarget.dataset.img === 'none') {
            setProcessingObject({
                ...processiongObject, video: {
                    processor: {
                        type: 'none',
                    },
                }
            })
        } else {


            setProcessingObject({
                ...processiongObject, video: {
                    processor: {
                        type: 'background-image',
                        config: {
                            source: event.currentTarget.src,
                        },
                    },
                }
            })

        }

    };


    return (

        <>

            {
                showCameraSettings && (<>

                    <div className='df aic jcsb fdc'>
                        <h4>Camera Background Image</h4>
                        <div className='df aic jcsb'>
                            <div>
                                <label htmlFor="cameraOptions">0%:</label>
                                <input type="radio" name="cameraBlur" value={0} onClick={blurCamera} />
                            </div>
                            <div>
                                <label htmlFor="cameraOptions">25%:</label>
                                <input type="radio" name="cameraBlur" value={0.25} onClick={blurCamera} />
                            </div>
                            <div>
                                <label htmlFor="cameraOptions">50%:</label>
                                <input type="radio" name="cameraBlur" value={0.5} onClick={blurCamera} />
                            </div>
                            <div>
                                <label htmlFor="cameraOptions">75%:</label>
                                <input type="radio" name="cameraBlur" value={0.75} onClick={blurCamera} />
                            </div>
                            <div>
                                <label htmlFor="cameraOptions">100%:</label>
                                <input type="radio" name="cameraBlur" value={1} onClick={blurCamera} />
                            </div>
                        </div>
                    </div>
                    <div className='df aic jcsb fdc backgroundImages'>
                        <h4>Camera Background Image</h4>
                        <div className='df aic jcsb g1'>
                            <div className="imageDiv">
                                <img src={Beach} onClick={cameraBackground}></img>

                            </div>
                            <div className="imageDiv">
                                <img src={Forest} data-img="forest" onClick={cameraBackground}></img>

                            </div>
                            <div className="imageDiv">
                                <img src={Mountain} onClick={cameraBackground}></img>

                            </div>
                            <div className="imageDiv">
                                <img src={Library} onClick={cameraBackground}></img>

                            </div>
                            <div className="imageDiv">
                                <img className='noImage' src={NoImage} data-img='none' onClick={cameraBackground}></img>
                            </div>
                        </div>

                    </div>


                </>)
            }

        </>
    )
}

export default BackgroundEffect