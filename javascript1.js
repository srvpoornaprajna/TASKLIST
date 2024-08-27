let shows=document.getElementsByClassName('show')
         let works=document.getElementsByClassName('works')
         for(let i=0;i<shows.length;i++)
         {
             shows[i].addEventListener('click',()=>{
                 if(works[i].style.display==='inline-block')
                 {
                     works[i].style.display='none'
                     shows[i].children[0].style.display='inline'
                    }
                    else{
                    works[i].style.display='inline-block'
                    shows[i].children[0].style.display='none'
                 }
             })
            
         }
         let lists=document.querySelectorAll('.listName')
         let check=document.querySelectorAll('#check')
         for(let i=0;i<check.length;i++)
         {
             check[i].addEventListener('click',()=>{
                 check[i].className='red'
                   lists[i].className='gone'  
                   setTimeout(()=>{
                    document.querySelectorAll('.checkbox')[i].submit()
                   },700)  
                    
             })
         }