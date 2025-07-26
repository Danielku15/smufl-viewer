document.querySelector<HTMLButtonElement>('.navbar-toggler')!.onclick = (e) =>{
    const nav = (e.target as HTMLButtonElement).closest('nav');
    const collapse = nav?.querySelector('.navbar-collapse');
    collapse?.classList.toggle('open');
};